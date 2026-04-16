// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const appointmentController = require("../controllers/appointmentController")
const appointmentValidate = require("../utilities/appointment-validation")

/* *****************************
 * Client Routes
 * *************************** */

// Submit a new test drive request (Client only, must be logged in)
router.post(
    "/request",
    utilities.checkLogin,
    appointmentValidate.appointmentRules(),
    appointmentValidate.checkAppointmentData,
    utilities.handleErrors(appointmentController.submitRequest)
)

// View own appointments (Client, must be logged in)
router.get(
    "/my",
    utilities.checkLogin,
    utilities.handleErrors(appointmentController.buildMyAppointments)
)

/* *****************************
 * Employee + Admin Routes
 * *************************** */

// View all appointments management list
router.get(
    "/manage",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(appointmentController.buildManageAppointments)
)

// Update appointment status (confirm / cancel / complete)
router.post(
    "/update-status",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(appointmentController.updateStatus)
)

/* *****************************
 * Admin Only Routes
 * *************************** */

// Hard delete an appointment record
router.post(
    "/delete",
    utilities.checkLogin,
    utilities.checkAdminOnly,
    utilities.handleErrors(appointmentController.deleteAppointment)
)

// View full audit log
router.get(
    "/audit-log",
    utilities.checkLogin,
    utilities.checkAdminOnly,
    utilities.handleErrors(appointmentController.buildAuditLog)
)

module.exports = router
