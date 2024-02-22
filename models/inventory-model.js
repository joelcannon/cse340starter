const pool = require("../database/");

// executeQuery function to run queries and catch errors
async function executeQuery(query, params) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ***************************
 *  Get all classification data with the creator name and filtered by approval status
 * ************************** */
async function getClassifications(cApproved = null) {
  let query = `
    SELECT c.*,  
    COALESCE(a.account_firstname, 'NA') AS account_firstname, 
    COALESCE(a.account_lastname, '') AS account_lastname
    FROM public.classification AS c
    LEFT JOIN public.account AS a ON c.account_id = a.account_id`;

  const params = [];

  if (cApproved !== null) {
    query += " WHERE c.classification_approved = $1";
    params.push(cApproved);
  }

  query += " ORDER BY c.classification_name"; // alphabetical

  // const result = await pool.query(query, params);
  // return result.rows;
  return executeQuery(query, params);
}

/* ***************************
 *  add new unapproved classification with who added it
 * ************************** */
async function addNewClassification(classification_name, account_id = null) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name, account_id, classification_approved, classification_approval_date) VALUES ($1, $2, false, NOW()) RETURNING *",
      [classification_name, account_id]
    );
    return result;
  } catch (err) {
    if (err.code === "23505") {
      // 23505 is the error code for a unique violation in PostgreSQL
      throw new Error("Classification name already exists");
    } else {
      throw err;
    }
  }
}

/* ***************************
 *  add new inventory
 * ************************** */
async function addNewInventory(
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id,
  account_id = null
) {
  try {
    const result = await pool.query(
      "INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id, account_id, inv_approved, inv_approved_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW()) RETURNING *",
      [
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
        account_id,
      ]
    );
    return result;
  } catch (err) {
    if (err.code === "23505") {
      // 23505 is the error code for a unique violation in PostgreSQL
      throw new Error("Vehicle already exists");
    } else {
      throw err;
    }
  }
}

/* ***************************
 *  update inventory
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id,
  account_id = null
) {
  try {
    const result = await pool.query(
      "UPDATE public.inventory SET inv_make = $2, inv_model = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_year = $8, inv_miles = $9, inv_color = $10, classification_id = $11, account_id = $12, inv_approved = false, inv_approved_date = NOW() WHERE inv_id = $1 RETURNING *",
      [
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
        account_id,
      ]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      // 23505 is the error code for a unique violation in PostgreSQL
      throw new Error("Vehicle already exists");
    } else {
      throw err;
    }
  }
}

/* ***************************
 *  delete inventory
 * ************************** */
async function deleteInventory(inv_id) {
  const result = await pool.query(
    "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *",
    [inv_id]
  );
  return result.rows[0];
}

/* **********************
 *   Check for existing classification name
 * ********************* */
async function checkExistingName(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const name = await pool.query(sql, [classification_name]);
    return name.rowCount;
  } catch (error) {
    return error.message;
  }
}

async function getInventoryByClassificationId(
  classification_id,
  approvalStatus
) {
  let approvalCondition = "";
  switch (approvalStatus) {
    case "approved":
      approvalCondition = "AND i.inv_approved = true";
      break;
    case "any":
      approvalCondition = "";
      break;
    default:
      throw new Error("Invalid approval status");
  }

  const query = `
    SELECT * FROM public.inventory AS i 
    JOIN public.classification AS c 
    ON i.classification_id = c.classification_id 
    WHERE i.classification_id = $1 ${approvalCondition}`;
  const params = [classification_id];

  return await executeQuery(query, params);
}

/* ***************************
 *  Get unapproved inventory with account names
 * ************************** */
async function getUnapprovedInventoryWithAccountNames() {
  const query = `
    SELECT 
      i.*, 
      COALESCE(a.account_firstname, 'NA') AS account_firstname, 
      COALESCE(a.account_lastname, '') AS account_lastname,
      c.classification_name
    FROM 
      public.inventory i
    LEFT JOIN 
      public.account a ON i.account_id = a.account_id
    JOIN
      public.classification c ON i.classification_id = c.classification_id
    WHERE 
      i.inv_approved = false
    ORDER BY 
      i.inv_id`;

  return await executeQuery(query);
}

/* ***************************
 *  Get a specific vehicle by inventory id
 * ************************** */
async function getVehicleById(inv_id) {
  const query = `SELECT * FROM public.inventory WHERE inv_id = $1`;
  const params = [inv_id];

  const data = await executeQuery(query, params);
  if (data.length === 0) {
    throw new Error(`No vehicle found with id ${inv_id}`);
  }
  return data[0];
}

/* ***************************
 *  Approve a classification
 * ************************** */
async function approveClassification(classificationId, accountId) {
  const query = `
    UPDATE 
      public.classification
    SET 
      classification_approved = true, 
      classification_approval_date = NOW(), 
      account_id = $2
    WHERE 
      classification_id = $1`;

  try {
    await pool.query(query, [classificationId, accountId]);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getApprovedClassifications(inventoryApprovalStatus) {
  let subQuery = "";
  switch (inventoryApprovalStatus) {
    case "approved":
      subQuery = "AND i.inv_approved = true";
      break;
    case "unapproved":
      subQuery = "AND i.inv_approved = false";
      break;
    case "any":
      subQuery = "";
      break;
    default:
      throw new Error("Invalid inventory approval status");
  }

  const query = `
    SELECT 
      c.classification_id, 
      c.classification_name, 
      c.classification_approval_date
    FROM 
      public.classification c
    WHERE 
      c.classification_approved = true AND
      EXISTS (
        SELECT 1 FROM public.inventory i
        WHERE i.classification_id = c.classification_id ${subQuery}
      )
    ORDER BY 
      c.classification_name`;

  return await executeQuery(query);
}

/* ***************************
 *  Approve an inventory
 * ************************** */
async function approveInventory(inventoryId, accountId) {
  const query = `
    UPDATE 
      public.inventory
    SET 
      inv_approved = true, 
      inv_approved_date = NOW(), 
      account_id = $2
    WHERE 
      inv_id = $1
    RETURNING *`;

  try {
    const result = await pool.query(query, [inventoryId, accountId]);
    return result.rows[0]; // Return the updated row
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function deleteClassification(classificationId) {
  const result = await pool.query(
    "DELETE FROM public.classification WHERE classification_id = $1 RETURNING *",
    [classificationId]
  );
  return result.rows[0];
}

module.exports = {
  getClassifications,
  getApprovedClassifications,
  getInventoryByClassificationId,
  getUnapprovedInventoryWithAccountNames,

  getVehicleById,
  checkExistingName,

  addNewInventory,
  updateInventory,
  approveInventory,
  deleteInventory,

  addNewClassification,
  approveClassification,
  deleteClassification,
};
