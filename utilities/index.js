const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {
  getNav: async function () {
    const rows = await invModel.getApprovedClassifications("approved");
    return `<ul>${rows
      .map(
        ({ classification_id, classification_name }) =>
          `<li><a href="/inv/type/${classification_id}" title="See our inventory of ${classification_name} vehicles">${classification_name}</a></li>`
      )
      .join("")}</ul>`;
  },

  buildClassificationList: async function (
    selectedId = null,
    cApproved = true // jwc
  ) {
    let rows;
    if (cApproved === true) {
      rows = await invModel.getClassifications(cApproved);
    } else {
      rows = await invModel.getApprovedClassifications("any");
    }
    return `<select name='classification_id' id='classification_id' required>
    <option value="">Choose a classification</option>
      ${rows
        .map(
          ({ classification_id, classification_name }) =>
            `<option value="${classification_id}" ${
              Number(classification_id) === Number(selectedId) ? "selected" : ""
            }>${classification_name}</option>`
        )
        .join("")}
    </select>`;
  },

  buildClassificationGrid: async function (data) {
    return data.length > 0
      ? `<ul id="inv-display">${data
          .map(
            (vehicle) => `<li>
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
      </li>`
          )
          .join("")}</ul>`
      : '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  },

  buildCarDetail: async function ({
    inv_image,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_description,
    inv_color,
  }) {
    return `
      <div class="car-details">
        <img src="${inv_image}" alt="${inv_make} ${inv_model}">
        <div class="car-info">
          <h4>${inv_make} ${inv_model} - ${inv_year} Details</h4>
          <p class="price">Price: $${new Intl.NumberFormat("en-US").format(
            inv_price
          )}</p>
          <p class="miles">Miles: ${new Intl.NumberFormat("en-US").format(
            inv_miles
          )}</p>
          <p class="description">${inv_description}</p>
          <p class="color">Color: ${inv_color}</p>
        </div>
      </div>`;
  },

  // regenerate jwt token with updated account data
  updateJwtCookie: (res, accountData) => {
    delete accountData.account_password;
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
    });
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
  },

  handleErrors: (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next),

  checkJWTToken: (req, res, next) => {
    if (req.cookies.jwt) {
      jwt.verify(
        req.cookies.jwt,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, accountData) {
          if (err) {
            req.flash("Please log in");
            res.clearCookie("jwt");
            return res.redirect("/account/login");
          }
          res.locals.accountData = accountData;
          res.locals.loggedin = 1;
          console.log("authorization established");
          next();
        }
      );
    } else {
      next();
    }
  },

  checkLogin: (req, res, next) => {
    if (res.locals.loggedin) {
      console.log("logged in");
      next();
    } else {
      req.flash("notice", "Please log in.");
      return res.redirect("/account/login");
    }
  },

  checkAccountType: (allowedTypes = ["Employee", "Admin"]) => {
    return (req, res, next) => {
      // Use the checkLogin function
      Util.checkLogin(req, res, () => {
        // If checkLogin calls next(), the user is logged in

        console.log("checkAccountType");

        // Check the account type
        const accountType = res.locals.accountData.account_type;
        if (!allowedTypes.includes(accountType)) {
          // restrict access - Users with disallowed account types not allowed
          req.flash(
            "notice",
            "You do not have permission to access that page."
          );
          return res.redirect("/account/login");
        }

        // If the account type is allowed, proceed to the next middleware
        next();
      });
    };
  },

  // get unapproved classifications with account names
  buildClassificationTable: async function () {
    const approvalStatus = false;
    const rows = await invModel.getClassifications(approvalStatus);
    // Set up the table labels
    let dataTable = `
    <table id="classificationTable">
      <thead>
        <tr>
          <th>Classification</th>
          <th>Added By</th>
          <th>Actions</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
    `;

    // Check if data array is empty
    if (rows.length === 0) {
      dataTable += `
        <tr>
          <td colspan="3">No new classifications need approval.</td>
        </tr>
      `;
    } else {
      // Iterate over all classifications in the array and put each in a row
      rows.forEach(
        ({
          classification_id,
          classification_name,
          account_firstname,
          account_lastname,
        }) => {
          const accountFullName = `${account_firstname} ${account_lastname}`;
          console.log(
            `${classification_id}, ${classification_name}; ${accountFullName}`
          );
          dataTable += `
          <tr id="row-${classification_id}">
            <td>${classification_name}</td>
            <td>${accountFullName}</td>
            <td><button class="approve-btn" onclick="approveClassification(${classification_id})">Approve</button></td>
            <td><button class="reject-btn" onclick="rejectClassification(${classification_id})">Reject</button></td>
          </tr>
        `;
        }
      );
    }

    dataTable += `</tbody>
    </table>`;

    // Return the built HTML table
    return dataTable;
  },

  buildInventoryTable: async function () {
    let rows;
    try {
      rows = await invModel.getUnapprovedInventoryWithAccountNames();
    } catch (error) {
      console.error(
        "Error getting unapproved inventory with account names:",
        error
      );
      rows = [];
    }

    let dataTable = `
      <table id="inventoryTable">
        <thead>
          <tr>
          <th>Classification</th>
          <th>Make:Model</th>
          <th>Added By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (rows.length === 0) {
      dataTable += `
        <tr>
          <td colspan="4">No new vehicles need approval.</td>
        </tr>
      `;
    } else {
      rows.forEach(
        ({
          inv_id,
          inv_make,
          inv_model,
          account_firstname,
          account_lastname,
          classification_name,
        }) => {
          const makeModel = `${inv_make}:${inv_model}`;
          const fullName = `${account_firstname} ${account_lastname}`;
          dataTable += `
          <tr id="row-${inv_id}">
          <td>${classification_name}</td>
          <td>${makeModel}</td>
          <td>${fullName}</td>
            <td>
              <a href="review-inventory/${inv_id}">Review</a>
            </td>
          </tr>
        `;
        }
      );
    }

    dataTable += `</tbody>
    </table>`;

    return dataTable;
  },
};

module.exports = Util;
