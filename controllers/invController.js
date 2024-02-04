const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Get vehicle by id
 * ************************** */
invCont.getVehicleById = async function (req, res) {
  const inv_id = req.params.vehicleId;
  const vehicle = await invModel.getVehicleById(inv_id);
  const detail = await utilities.buildCarDetail(vehicle);
  let nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detail,
  });
};

/* ***************************
 *  Management View
 * ************************** */
invCont.managementView = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/* ****************************************
 *  Process new classification
 * *************************************** */
invCont.addNewClassification = async function (req, res) {
  const { classification_name } = req.body;

  const regResult = await invModel.addNewClassification(classification_name);
  let nav = await utilities.getNav(); // get after adding new classification

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, new classification ${classification_name} added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "notice",
      "Sorry, unable to add this new classification, try again."
    );
    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification!",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Trigger Errors
 * ************************** */
invCont.triggerError = (req, res, next) => {
  try {
    let err = new Error("Intentional error triggered");
    err.status = 500;
    throw err;
  } catch (err) {
    next(err);
  }
};

module.exports = invCont;
