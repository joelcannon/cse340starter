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

module.exports = validate;
