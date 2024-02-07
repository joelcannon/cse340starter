const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

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
 *  build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationOptions = await utilities.getClassificationOptions();

  res.render("./inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationOptions,
    errors: null,
  });
};

/* ****************************************
 *  Process new inventory
 * *************************************** */
invCont.addNewInventory = async function (req, res) {
  const inventoryData = req.body;
  const regResult = await invModel.addNewInventory(inventoryData);
  let nav = await utilities.getNav();
  let classificationOptions = await utilities.getClassificationOptions(
    inventoryData.classification_id
  );

  if (regResult) {
    req.flash("notice", `Congratulations, this new vehicle was added.`);
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, unable to add this new vehicle, try again.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Vehicle!",
      nav,
      classificationOptions,
      errors: null,
    });
  }
};

/* ****************************************
 *  Process updated inventory
 * *************************************** */
invCont.editInventoryView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const [itemData] = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    ...itemData,
  });
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