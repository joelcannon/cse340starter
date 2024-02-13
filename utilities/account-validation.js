const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 0,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email,
          null
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 0,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/*  **********************************
 *  Profile Data Validation Rules
 * ********************************* */
validate.profileRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id; // get account_id from the request body
        const emailExists = await accountModel.checkExistingEmail(
          account_email,
          account_id
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
  ];
};

/*  **********************************
 *  Password Data Validation Rules
 * ********************************* */
validate.passwordRules = () => {
  return [
    // password is required and must be strong password
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 0,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const accountData = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      ...accountData,
    });
    return;
  }

  next();
};

/* ******************************
 * Check data and return errors or continue to Update Profile
 * ***************************** */
validate.checkProfileData = async (req, res, next) => {
  const accountData = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update-profile", {
      errors,
      title: "Update Profile",
      nav,
      ...accountData,
    });
    return;
  }

  next();
};

/* ******************************
 * Check data and return errors or continue to Update Password
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const accountData = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update-password", {
      errors,
      title: "Update Password",
      nav,
      account_password: accountData.account_password,
    });
    return;
  }

  next();
};

module.exports = validate;
