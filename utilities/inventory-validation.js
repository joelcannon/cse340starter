const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const inventoryModel = require("../models/inventory-model");
const validUrlRegex = /^\/[a-zA-Z0-9/.-]+$/;

validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .matches(/^[a-zA-Z]*$/)
    .isLength({ min: 1 })
    .withMessage("A single word with only one or more letters is required.")
    .custom(async (classification_name) => {
      if (await inventoryModel.checkExistingName(classification_name)) {
        throw new Error("Classification already exists.");
      }
    }),
];

validate.checkClassification = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationList,
      errors,
    });
    return;
  }
  next();
};

// apply inventory rules
validate.inventoryRules = () => [
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
    .custom((value) => validUrlRegex.test(value))
    .withMessage("Image must be a valid partial URL."),
  body("inv_thumbnail")
    .trim()
    .custom((value) => validUrlRegex.test(value))
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

// check inventory data when adding new inventory
validate.checkInventoryData = async (req, res, next) => {
  const inventoryData = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      inventoryData.classification_id
    );

    res.render("inventory/inventory-form", {
      title: "Add Vehicle",
      isUpdate: false, // edit view
      nav,
      classificationList,
      ...inventoryData,
      errors,
    });
    return;
  }

  next();
};

// check inventory data when updating inventory
validate.checkUpdateData = async (req, res, next) => {
  const inventoryData = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      inventoryData.classification_id
    );

    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`;

    res.render("inventory/inventory-form", {
      title: `Edit ${itemName}`,
      isUpdate: true, // update view
      nav,
      classificationList,
      ...inventoryData,
      errors,
    });
    return;
  }

  next();
};

module.exports = validate;
