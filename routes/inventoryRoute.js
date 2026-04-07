// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Public routes (no auth needed)
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

// Admin routes — require Employee or Admin
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement))
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))
router.get("/edit/:invId", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory))
router.get("/delete/:invId", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirm))
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.post(
    "/add-classification",
    utilities.checkLogin, utilities.checkAccountType,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
router.post(
    "/add-inventory",
    utilities.checkLogin, utilities.checkAccountType,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)
router.post(
    "/update/",
    utilities.checkLogin, utilities.checkAccountType,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)
router.post(
    "/delete",
    utilities.checkLogin, utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router