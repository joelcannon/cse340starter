const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
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
invCont.getVehicleById = async function (req, res, next) {
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
