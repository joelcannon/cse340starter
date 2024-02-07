// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/account-controller");
const regValidate = require("../utilities/account-validation");

// Route to build login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build register page
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to process register page
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post("/login", (req, res) => {
  regValidate.loginRules(),
    regValidate.checkLoginData,
    res.status(200).send("login process");
});

module.exports = router;
