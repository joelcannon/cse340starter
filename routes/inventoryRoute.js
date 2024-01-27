// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

// Test route to trigger an error
router.get("/error", (req, res) => {
  throw new Error("Test error");
});

router.get(
  "/trigger-error",
  utilities.handleErrors(invController.triggerError)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:vehicleId",
  utilities.handleErrors(invController.getVehicleById)
);

module.exports = router;
