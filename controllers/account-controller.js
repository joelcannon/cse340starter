const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ***************************
 *  build login view
 * ************************** */
async function buildLogin(req, res) {
  const nav = await utilities.getNav();
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
  const nav = await utilities.getNav();
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
  const nav = await utilities.getNav();
  let accountData = req.body;

  // Hash the password before storing
  try {
    // regular password and cost (salt is generated automatically)
    accountData.account_password = await bcrypt.hash(
      accountData.account_password,
      10
    );
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

  const regResult = await accountModel.registerAccount(
    ...Object.values(accountData)
  );

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

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    return renderLoginError(req, res, account_email);
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    } else {
      return renderLoginError(req, res, account_email);
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
}

async function renderLoginError(req, res, account_email) {
  const nav = await utilities.getNav();
  const errorMessage = "Please check your credentials and try again.";
  req.flash("notice", errorMessage);
  res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
  });
}

/* ***************************
 *  build management view
 * ************************** */
async function buildManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Management",
    nav,
    errors: null,
  });
}

/* ***************************
 *  build account management view
 * ************************** */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav();
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  });
}

/* ***************************
 *  Build update profile view
 * ************************** */
async function buildUpdateProfile(req, res) {
  const nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  res.render("account/update-profile", {
    title: `Update Profile`,
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  });
}

/* ****************************************
 *  update profile
 * *************************************** */
async function updateProfile(req, res) {
  const nav = await utilities.getNav();
  let accountData = req.body;

  const updateResults = await accountModel.updateProfile(
    ...Object.values(accountData)
  );

  if (updateResults) {
    utilities.updateJwtCookie(res, updateResults.rows[0]);

    req.flash(
      "notice",
      `Congratulations, you're update ${updateResults.rows[0].account_firstname}.`
    );
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the profile update failed.");
    res.status(501).render("account/update-profile", {
      title: "Update Profile",
      nav,
      errors: null,
      ...accountData,
    });
  }
}

/* ***************************
 *  Build update password view
 * ************************** */
async function buildUpdatePassword(req, res) {
  const nav = await utilities.getNav();
  const accountData = res.locals.accountData;

  res.render("account/update-password", {
    title: `Update Password`,
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_password: accountData.account_password,
  });
}

/* ****************************************
 *  update password
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav();
  let accountData = req.body;

  // Hash the password before storing
  try {
    // regular password and cost (salt is generated automatically)
    accountData.account_password = await bcrypt.hash(
      accountData.account_password,
      10
    );
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password.");
    res.status(500).render("account/update-password", {
      title: "Update Password",
      nav,
      errors: null,
    });
    return; // return early to prevent further execution
  }

  const updateResults = await accountModel.updatePassword(
    ...Object.values(accountData)
  );

  if (updateResults) {
    req.flash(
      "notice",
      `Congratulations, your password is updated, ${updateResults.rows[0].account_firstname}.`
    );
    res.status(201).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    res.status(501).render("account/update-password", {
      title: "Update Password",
      nav,
      errors: null,
      ...accountData,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildAccountManagement,
  buildUpdateProfile,
  updateProfile,
  buildUpdatePassword,
  updatePassword,
};
