const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(approvalStatus = null) {
  let query = "SELECT * FROM public.classification";

  if (approvalStatus !== null) {
    query += " WHERE classification_approved = $1"; // newest first
    return await pool.query(query, [approvalStatus]);
  }

  query += " ORDER BY classification_name"; // alphabetical

  return await pool.query(query);
}

/* ***************************
 *  add new classification
 * ************************** */
async function addNewClassification(classification_name, account_id = null) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name, account_id, classification_approved, classification_approved_date) VALUES ($1, $2, false, NOW()) RETURNING *",
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

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error(`getInventoryByClassificationId error ${error}`);
  }
}

/* ***************************
 *  Get a specific vehicle by inventory id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    if (data.rows.length === 0) {
      throw new Error(`No vehicle found with id ${inv_id}`);
    }
    return data.rows[0];
  } catch (error) {
    console.error(`getVehicleById error ${error}`);
  }
}

/* ***************************
 *  Get all unapproved classification data
 * ************************** */
async function getUnapprovedClassifications() {
  const query = `
    SELECT 
      c.classification_id, 
      c.classification_name, 
      c.classification_approved_date, 
      a.account_firstname, 
      a.account_lastname
    FROM 
      public.classification c
    LEFT JOIN 
      public.account a ON c.account_id = a.account_id
    WHERE 
      c.classification_approved = false
    ORDER BY 
      c.classification_id`;

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
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
      classification_approved_date = NOW(), 
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

/* ***************************
 *  Get approved classifications linked to at least one inventory
 * ************************** */
async function getApprovedClassificationsWithInventory() {
  const query = `
    SELECT 
      c.classification_id, 
      c.classification_name, 
      c.classification_approved_date
    FROM 
      public.classification c
    WHERE 
      c.classification_approved = true AND
      EXISTS (
        SELECT 1 FROM public.inventory i
        WHERE i.classification_id = c.classification_id
      )
    ORDER BY 
      c.classification_name`;

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ***************************
 *  Get approved classifications linked to at least one unapproved inventory
 * ************************** */
async function getApprovedClassificationsWithUnapprovedInventory() {
  const query = `
    SELECT 
      c.classification_id, 
      c.classification_name, 
      c.classification_approved_date
    FROM 
      public.classification c
    WHERE 
      c.classification_approved = true AND
      EXISTS (
        SELECT 1 FROM public.inventory i
        WHERE i.classification_id = c.classification_id AND
              i.inv_approved = false
      )
    ORDER BY 
      c.classification_name`;

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ***************************
 *  Get unapproved inventory with account names
 * ************************** */
async function getUnapprovedInventoryWithAccountNames() {
  const query = `
    SELECT 
      i.inv_id, 
      i.inv_name, 
      i.inv_approved_date, 
      a.account_firstname, 
      a.account_lastname
    FROM 
      public.inventory i
    JOIN 
      public.account a ON i.account_id = a.account_id
    WHERE 
      i.inv_approved = false
    ORDER BY 
      i.inv_id`;

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error(err);
    throw err;
  }
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
      inv_id = $1`;

  try {
    await pool.query(query, [inventoryId, accountId]);
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
  getInventoryByClassificationId,
  getVehicleById,
  addNewClassification,
  checkExistingName,
  addNewInventory,
  updateInventory,
  deleteInventory,

  getUnapprovedClassifications,
  approveClassification,
  getApprovedClassificationsWithInventory,
  getApprovedClassificationsWithUnapprovedInventory,
  getUnapprovedInventoryWithAccountNames,
  approveInventory,
  deleteClassification,
};
