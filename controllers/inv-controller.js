const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res) {
  const { classification_id } = req.params;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  const nav = await utilities.getNav();
  const className =
    data.length > 0 ? data[0].classification_name : "No classification";
  res.render("./inventory/classification", {
    title: `${className} vehicles`,
    nav,
    grid,
  });
};

/* ***************************
 *  Get vehicle by id
 * ************************** */
invCont.getVehicleById = async function (req, res) {
  const { inv_id } = req.params;
  const vehicle = await invModel.getVehicleById(inv_id);
  const detail = await utilities.buildCarDetail(vehicle);
  const nav = await utilities.getNav();
  res.render("./inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    detail,
  });
};

/* ***************************
 *  Build Management View
 * ************************** */
invCont.buildManagementView = async function (req, res) {
  const nav = await utilities.getNav();

  const classificationList = await utilities.buildClassificationList();
  const newClassificationList = await utilities.buildClassificationList(
    null,
    false
  );

  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationList,
    newClassificationList,
    errors: null,
  });
};

/* ***************************
 *  build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav();
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
  const nav = await utilities.getNav(); // get after adding new classification
  const classificationList = await utilities.buildClassificationList();
  const newClassificationList = await utilities.buildClassificationList(
    null,
    false
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, new classification ${classification_name} added.`
    );
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationList,
      newClassificationList,
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
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();

  res.render("./inventory/inventory-form", {
    title: "Add Vehicle",
    isUpdate: false,
    nav,
    classificationList,
    errors: null,
  });
};

/* ****************************************
 *  Process new inventory
 * *************************************** */
invCont.addNewInventory = async function (req, res) {
  const inventoryData = req.body;
  const regResult = await invModel.addNewInventory(
    inventoryData.inv_make,
    inventoryData.inv_model,
    inventoryData.inv_description,
    inventoryData.inv_image,
    inventoryData.inv_thumbnail,
    inventoryData.inv_price,
    inventoryData.inv_year,
    inventoryData.inv_miles,
    inventoryData.inv_color,
    inventoryData.classification_id
  );
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList(
    inventoryData.classification_id
  );
  const newClassificationList = await utilities.buildClassificationList(
    inventoryData.classification_id,
    false
  );

  if (regResult) {
    req.flash("notice", `Congratulations, this new vehicle was added.`);
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationList,
      newClassificationList,
    });
  } else {
    req.flash("notice", "Sorry, unable to add this new vehicle, try again.");
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Vehicle!",
      nav,
      classificationList,
      newClassificationList,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);

  if (isNaN(classification_id)) {
    return next(new Error("Invalid classification_id"));
  }

  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );

  return res.json(invData);
};

/* ****************************************
 *  Process updated inventory
 * *************************************** */
invCont.editInventoryView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);

  if (!itemData) {
    // Handle the error: return an error response or render a different view
    return res.status(404).send("Vehicle not found");
  }

  const classificationList = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/inventory-form", {
    title: `Edit ${itemName}`,
    isUpdate: true,
    nav,
    classificationList,
    errors: null,
    ...itemData,
  });
};

/* ****************************************
 *  Process delete inventory
 * *************************************** */
invCont.deleteInventoryView = async function (req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);

  console.warn("inside controller.deleteInventoryView", itemData);

  if (!itemData) {
    // Handle the error: return an error response or render a different view
    return res.status(404).send("Vehicle not found");
  }

  // const classificationList = await utilities.buildClassificationList(
  //   itemData.classification_id
  // );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

  res.render("./inventory/inventory-delete", {
    title: `Delete ${itemName}`,
    // isUpdate: true,
    nav,
    // classificationList,
    errors: null,
    ...itemData,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const inventoryData = req.body;
  const updateResult = await invModel.updateInventory(
    inventoryData.inv_id,
    inventoryData.inv_make,
    inventoryData.inv_model,
    inventoryData.inv_description,
    inventoryData.inv_image,
    inventoryData.inv_thumbnail,
    inventoryData.inv_price,
    inventoryData.inv_year,
    inventoryData.inv_miles,
    inventoryData.inv_color,
    inventoryData.classification_id
  );

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      inventoryData.classification_id
    );
    const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      ...inventoryData,
    });
  }
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res) {
  // const { inv_id } = req.body;
  const inventoryData = req.body;
  const deleteResult = await invModel.deleteInventory(inventoryData.inv_id);

  console.warn("inside controller.deleteInventory", deleteResult);

  if (deleteResult) {
    const itemName = `${deleteResult.inv_make} ${deleteResult.inv_model}`;
    req.flash("notice", `The ${itemName} was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.status(501).render("inventory/inventory-delete", {
      title: `Delete ${inventoryData.inv_make} ${inventoryData.inv_model}`,
      errors: null,
      ...req.body,
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
