// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/inv-controller");
const utilities = require("../utilities");
const Validate = require("../utilities/inventory-validation");

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
  "/type/:classification_id",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.getVehicleById)
);

// Route to inventory management view
router.get(
  "/",
  utilities.checkAccountType(),
  utilities.handleErrors(invController.buildManagementView)
);

// Route to build add classification form
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post classification form
router.post(
  "/add-classification",
  Validate.classificationRules(),
  Validate.checkClassification,
  utilities.handleErrors(invController.addNewClassification)
);

// Route to build add inventory form
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to post inventory form
router.post(
  "/add-inventory",
  Validate.inventoryRules(),
  Validate.checkInventoryData,
  utilities.handleErrors(invController.addNewInventory)
);

// Route to get inventory data
router.get(
  "/get-inventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build edit inventory form
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

// Route to update inventory form
router.post(
  "/update/",
  Validate.inventoryRules(),
  Validate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build delete inventory form
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventoryView)
);

// Route to delete inventory item
router.post(
  // "/delete/:inv_id",
  "/delete/",
  utilities.handleErrors(invController.deleteInventory)
);

// Route to approve changes view
router.get(
  "/approve-changes/",
  utilities.checkAccountType(["Admin"]),
  utilities.handleErrors(invController.buildApproveChanges)
);

// Route to approve classification
router.post(
  "/approve-classification/:classification_id",
  utilities.handleErrors(invController.approveClassification)
);

// Route to reject classification
router.post(
  "/reject-classification/:classification_id",
  utilities.handleErrors(invController.rejectClassification)
);

module.exports = router;
