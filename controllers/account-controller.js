const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ***************************
 *  build login view
 * ************************** */
async function buildLogin(req, res) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ***************************
 *  Build register view
 * ************************** */
async function buildRegister(req, res) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  let accountData = req.body;

  // Hash the password before storing
  try {
    // regular password and cost (salt is generated automatically)
    console.time("hashing");
    accountData.account_password = await bcrypt.hash(
      accountData.account_password,
      10
    );
    console.timeEnd("hashing");
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
    return; // return early to prevent further execution
  }

  const regResult = await accountModel.registerAccount(accountData);

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${accountData.account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount };
