const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const inventoryModel = require("../models/inventory-model");

/*  **********************************
 *  Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // valid name is required and cannot already exist in the database
    body("classification_name")
      .trim()
      .matches(/^[a-zA-Z]*$/)
      .isLength({ min: 1 })
      .withMessage("A single word with only one or more letters is required.")
      .custom(async (classification_name) => {
        const nameExists = await inventoryModel.checkExistingName(
          classification_name
        );
        if (nameExists) {
          throw new Error("Classification already exists.");
        }
      }),
  ];
};

/* ******************************
 * Check classification and return errors or continue to Management
 * ***************************** */
validate.checkClassification = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      errors,
      title: "Vehicle Management",
      nav,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Inventory Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Make must be at least two characters long."),
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least three characters long."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty."),
    body("inv_image")
      .trim()
      .custom((value) => /^\/[a-zA-Z0-9/.-]+$/.test(value))
      .withMessage("Image must be a valid partial URL."),
    body("inv_thumbnail")
      .trim()
      .custom((value) => /^\/[a-zA-Z0-9/.-]+$/.test(value))
      .withMessage("Thumbnail must be a valid partial URL."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive decimal."),
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be between 1900 and 2100."),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),
    body("inv_color")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Color must be at least two characters long."),
  ];
};

/* *******************************
 * Check inventory and return errors or continue to Management
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    // Call the function to get the options
    let classificationOptions = await utilities.getClassificationOptions(
      req,
      res
    );
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
      classificationOptions,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

module.exports = validate;
