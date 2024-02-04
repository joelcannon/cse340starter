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
async function addNewClassification(classificationName) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classificationName]
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
    console.error(`getclassificationsbyid error ${error}`);
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
};
