// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");

// Test route to trigger an error
router.get("/error", () => {
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

// Route to inventory management view
router.get("/", utilities.handleErrors(invController.managementView));

// Route to build add classification form
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post classification form
router.post(
  "/add-classification",
  utilities.handleErrors(invController.addNewClassification)
);

module.exports = router;
