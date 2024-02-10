const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  add new classification
 * ************************** */
async function addNewClassification(classification_name) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
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
  classification_id
) {
  try {
    const result = await pool.query(
      "INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
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
    return data.rows[0];
  } catch (error) {
    console.error(`getVehicleById error ${error}`);
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addNewClassification,
  checkExistingName,
  addNewInventory,
};
