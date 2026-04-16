const utilities = require(".")
const { body, validationResult } = require("express-validator")
const appointmentModel = require("../models/appointment-model")
const validate = {}

/* *****************************
 * Appointment Request Validation Rules
 * *************************** */
validate.appointmentRules = () => {
    return [
        body("appointment_date")
            .notEmpty()
            .withMessage("Please select a date.")
            .isDate()
            .withMessage("Please enter a valid date.")
            .custom((value) => {
                const selected = new Date(value)
                const today = new Date()
                // Zero out time portion for fair date-only comparison
                today.setHours(0, 0, 0, 0)
                if (selected < today) {
                    throw new Error("Appointment date must be today or in the future.")
                }
                return true
            }),

        body("appointment_time")
            .notEmpty()
            .withMessage("Please select a time.")
            .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .withMessage("Please enter a valid time."),

        body("contact_phone")
            .trim()
            .notEmpty()
            .withMessage("Please provide a contact phone number.")
            .matches(/^[0-9\+\-\(\)\s]{7,20}$/)
            .withMessage("Please enter a valid phone number."),

        body("notes")
            .trim()
            .optional({ checkFalsy: true })
            .isLength({ max: 500 })
            .withMessage("Notes must be 500 characters or fewer."),
    ]
}

/* *****************************
 * Check appointment data — return errors or continue
 * Also checks DB-level conflicts
 * *************************** */
validate.checkAppointmentData = async (req, res, next) => {
    const { inv_id, appointment_date, appointment_time, contact_phone, notes } = req.body
    let errors = validationResult(req)

    // Even if express-validator passes, check for conflicts in the DB
    if (errors.isEmpty()) {
        // 1. Check if a confirmed booking already exists for this slot
        const confirmedConflict = await appointmentModel.checkConfirmedConflict(
            inv_id,
            appointment_date,
            appointment_time
        )
        if (confirmedConflict) {
            req.flash(
                "notice",
                "Sorry, that time slot is already confirmed for another client. Please choose a different date or time."
            )
            return res.redirect(`/inv/detail/${inv_id}`)
        }

        // 2. Check if this client already has an appointment at the same time
        const clientConflict = await appointmentModel.checkClientTimeConflict(
            res.locals.accountData.account_id,
            appointment_date,
            appointment_time
        )
        if (clientConflict) {
            req.flash(
                "notice",
                "You already have an appointment at that date and time. Please choose a different slot."
            )
            return res.redirect(`/inv/detail/${inv_id}`)
        }
    }

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        // Re-fetch vehicle data to re-render the detail page with errors
        const invModel = require("../models/inventory-model")
        const data = await invModel.getInventoryById(inv_id)
        const grid = await utilities.buildDetailsGrid(data)
        const className = `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`
        return res.status(400).render("inventory/details", {
            title: className,
            nav,
            grid,
            errors,
            inv_id,
            appointment_date,
            appointment_time,
            contact_phone,
            notes,
        })
    }
    next()
}

module.exports = validate
