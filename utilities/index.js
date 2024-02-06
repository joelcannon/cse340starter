const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  // let list = `<ul><li><a href="/" title="Home page">Home</a></li>`;
  let list = `<ul>`;
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
  });
  list += "</ul>";
  return list;
};

/* ************************
 * Constructs the options HTML for classification select element
 ************************** */
Util.getClassificationOptions = async function (selectedId) {
  let data = await invModel.getClassifications();
  let options = "";
  data.rows.forEach((row) => {
    if (Number(row.classification_id) === Number(selectedId)) {
      options += `<option value="${row.classification_id}" selected>${row.classification_name}</option>`;
    } else {
      options += `<option value="${row.classification_id}">${row.classification_name}</option>`;
    }
  });
  return options;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `<li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${
        vehicle.inv_make
      } ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</span>
        </div>
      </li>`;
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the detail view HTML
 * ************************************ */

Util.buildCarDetail = async function (data) {
  let content = `
    <div class="car-details">
      <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      <div class="car-info">
        <h4>${data.inv_make} ${data.inv_model} - ${data.inv_year} Details</h4>
        <p class="price">Price: $${new Intl.NumberFormat("en-US").format(
          data.inv_price
        )}</p>
        <p class="miles">Miles: ${new Intl.NumberFormat("en-US").format(
          data.inv_miles
        )}</p>
        <p class="description">${data.inv_description}</p>
        <p class="color">Color: ${data.inv_color}</p>
      </div>
    </div>`;
  return content;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
