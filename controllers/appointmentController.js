const utilities = require("../utilities/")
const appointmentModel = require("../models/appointment-model")
const auditLogModel = require("../models/audit-log-model")
const invModel = require("../models/inventory-model")

/* *****************************
 * Submit a new test drive request (Client)
 * *************************** */
async function submitRequest(req, res, next) {
    const { inv_id, appointment_date, appointment_time, contact_phone, notes } = req.body
    const account = res.locals.accountData

    const newAppointment = await appointmentModel.createAppointment(
        account.account_id,
        inv_id,
        appointment_date,
        appointment_time,
        contact_phone,
        notes || null
    )

    if (newAppointment) {
        // Fetch vehicle info for the audit log label
        const vehicleData = await invModel.getInventoryById(inv_id)
        const vehicleLabel = vehicleData.length
            ? `${vehicleData[0].inv_year} ${vehicleData[0].inv_make} ${vehicleData[0].inv_model}`
            : `Vehicle #${inv_id}`

        // Write CREATED entry to audit log
        await auditLogModel.insertLog(
            newAppointment.appointment_id,
            account.account_id,
            account.account_firstname,
            account.account_lastname,
            account.account_type,
            "CREATED",
            null,
            "pending",
            vehicleLabel,
            `${account.account_firstname} ${account.account_lastname}`
        )

        req.flash(
            "notice",
            `Your test drive request for the ${vehicleLabel} has been submitted and is awaiting confirmation from our team.`
        )
        return res.redirect("/appointments/my")
    } else {
        req.flash("notice", "Sorry, there was an error submitting your request. Please try again.")
        return res.redirect(`/inv/detail/${inv_id}`)
    }
}

/* *****************************
 * Build "My Appointments" view (Client)
 * *************************** */
async function buildMyAppointments(req, res, next) {
    let nav = await utilities.getNav()
    const account_id = res.locals.accountData.account_id
    const appointments = await appointmentModel.getAppointmentsByAccount(account_id)

    res.render("appointments/my-appointments", {
        title: "My Test Drive Appointments",
        nav,
        appointments,
        errors: null,
    })
}

/* *****************************
 * Build appointment management view (Employee + Admin)
 * *************************** */
async function buildManageAppointments(req, res, next) {
    let nav = await utilities.getNav()
    const appointments = await appointmentModel.getAllAppointments()

    res.render("appointments/manage", {
        title: "Manage Appointments",
        nav,
        appointments,
        errors: null,
    })
}

/* *****************************
 * Update appointment status (Employee + Admin)
 * *************************** */
async function updateStatus(req, res, next) {
    const { appointment_id, new_status } = req.body
    const staff = res.locals.accountData

    // Fetch the current appointment before changing it
    const appointment = await appointmentModel.getAppointmentById(parseInt(appointment_id))

    if (!appointment) {
        req.flash("notice", "Appointment not found.")
        return res.redirect("/appointments/manage")
    }

    const previous_status = appointment.status
    const vehicleLabel = `${appointment.inv_year} ${appointment.inv_make} ${appointment.inv_model}`
    const clientName = `${appointment.account_firstname} ${appointment.account_lastname}`

    // Perform the status update
    const updated = await appointmentModel.updateAppointmentStatus(
        parseInt(appointment_id),
        new_status
    )

    if (!updated) {
        req.flash("notice", "Sorry, the status update failed. Please try again.")
        return res.redirect("/appointments/manage")
    }

    // Write to audit log
    await auditLogModel.insertLog(
        parseInt(appointment_id),
        staff.account_id,
        staff.account_firstname,
        staff.account_lastname,
        staff.account_type,
        new_status.toUpperCase(),
        previous_status,
        new_status,
        vehicleLabel,
        clientName
    )

    // If confirming: auto-cancel all OTHER pending requests for the same slot
    if (new_status === "confirmed") {
        const cancelled = await appointmentModel.cancelConflictingPending(
            appointment.inv_id,
            appointment.appointment_date,
            appointment.appointment_time,
            parseInt(appointment_id)
        )

        // Log each auto-cancellation in the audit trail
        for (const cancelledAppt of cancelled) {
            await auditLogModel.insertLog(
                cancelledAppt.appointment_id,
                staff.account_id,
                staff.account_firstname,
                staff.account_lastname,
                staff.account_type,
                "CANCELLED",
                "pending",
                "cancelled",
                vehicleLabel,
                clientName
            )
        }

        if (cancelled.length > 0) {
            req.flash(
                "notice",
                `Appointment confirmed for ${clientName}. ${cancelled.length} conflicting pending request(s) were automatically cancelled.`
            )
        } else {
            req.flash("notice", `Appointment confirmed for ${clientName}.`)
        }
    } else {
        req.flash("notice", `Appointment status updated to "${new_status}".`)
    }

    return res.redirect("/appointments/manage")
}

/* *****************************
 * Delete an appointment (Admin only)
 * *************************** */
async function deleteAppointment(req, res, next) {
    const { appointment_id } = req.body
    const staff = res.locals.accountData

    // Fetch before deleting for the audit log record
    const appointment = await appointmentModel.getAppointmentById(parseInt(appointment_id))

    if (!appointment) {
        req.flash("notice", "Appointment not found.")
        return res.redirect("/appointments/manage")
    }

    const vehicleLabel = `${appointment.inv_year} ${appointment.inv_make} ${appointment.inv_model}`
    const clientName = `${appointment.account_firstname} ${appointment.account_lastname}`

    // Log the deletion BEFORE deleting
    await auditLogModel.insertLog(
        parseInt(appointment_id),
        staff.account_id,
        staff.account_firstname,
        staff.account_lastname,
        staff.account_type,
        "DELETED",
        appointment.status,
        null,
        vehicleLabel,
        clientName
    )

    const deleted = await appointmentModel.deleteAppointment(parseInt(appointment_id))

    if (deleted) {
        req.flash("notice", `Appointment for ${clientName} — ${vehicleLabel} has been deleted.`)
    } else {
        req.flash("notice", "Sorry, the deletion failed.")
    }

    return res.redirect("/appointments/manage")
}

/* *****************************
 * Build audit log view (Admin only)
 * *************************** */
async function buildAuditLog(req, res, next) {
    let nav = await utilities.getNav()
    const logs = await auditLogModel.getAllLogs()

    res.render("appointments/audit-log", {
        title: "Appointment Audit Log",
        nav,
        logs,
        errors: null,
    })
}

module.exports = {
    submitRequest,
    buildMyAppointments,
    buildManageAppointments,
    updateStatus,
    deleteAppointment,
    buildAuditLog,
}
