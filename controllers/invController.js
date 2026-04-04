const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
        errors: null,
    })
})

/* ***************************
 *  Build details by InventoryID view
 * ************************** */
invCont.buildByInventoryID = utilities.handleErrors(async function (req, res, next) {
    const inv_id = req.params.inventoryId
    const data = await invModel.getInventoryById(inv_id)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
    res.render('./inventory/details', {
        title: className,
        nav,
        grid,
        errors: null,
    })
})

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
    })
})

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
})

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = utilities.handleErrors(async function (req, res, next) {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)
    if (result.rowCount) {
        let nav = await utilities.getNav()
        req.flash("notice", `Classification "${classification_name}" added successfully.`)
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, adding the classification failed.")
        res.status(501).render("inventory/add-classification", {
            title: "Add Classification",
            nav: await utilities.getNav(),
            errors: null,
        })
    }
})

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = utilities.handleErrors(async function (req, res, next) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
    })
})

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = utilities.handleErrors(async function (req, res, next) {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    const result = await invModel.addInventory(
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
    )
    if (result.rowCount) {
        let nav = await utilities.getNav()
        req.flash("notice", `${inv_year} ${inv_make} ${inv_model} added successfully.`)
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
        })
    } else {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        req.flash("notice", "Sorry, adding the inventory item failed.")
        res.status(501).render("inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            classificationList,
            errors: null,
        })
    }
})

module.exports = invCont