// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");

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
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;