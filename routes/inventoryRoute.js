// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to build details by InventoryID view
router.get('/detail/:inventoryId', invController.buildByInventoryID)

// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Route to return inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Route to process add classification
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Route to process add inventory
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

// Route to process inventory update
router.post(
    "/update/",
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteView))

// Route to process inventory delete
router.post("/delete/", utilities.handleErrors(invController.deleteInventory))

module.exports = router