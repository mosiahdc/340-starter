const pool = require("../database/")

/* *****************************
 * Create a new appointment request
 * *************************** */
async function createAppointment(account_id, inv_id, appointment_date, appointment_time, contact_phone, notes) {
    try {
        const sql = `
      INSERT INTO test_drive_appointments
        (account_id, inv_id, appointment_date, appointment_time, contact_phone, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *`
        const result = await pool.query(sql, [account_id, inv_id, appointment_date, appointment_time, contact_phone, notes])
        return result.rows[0]
    } catch (error) {
        console.error("createAppointment error:", error)
        return null
    }
}

/* *****************************
 * Get all appointments for a specific client
 * *************************** */
async function getAppointmentsByAccount(account_id) {
    try {
        const sql = `
      SELECT
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.contact_phone,
        a.notes,
        a.status,
        a.cancellation_reason,
        a.created_at,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_thumbnail,
        i.inv_id
      FROM test_drive_appointments a
      JOIN inventory i ON a.inv_id = i.inv_id
      WHERE a.account_id = $1
      ORDER BY a.created_at DESC`
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        console.error("getAppointmentsByAccount error:", error)
        return []
    }
}

/* *****************************
 * Get all appointments (for Employee/Admin management view)
 * *************************** */
async function getAllAppointments() {
    try {
        const sql = `
      SELECT
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        a.contact_phone,
        a.notes,
        a.status,
        a.cancellation_reason,
        a.created_at,
        a.updated_at,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_id,
        ac.account_firstname,
        ac.account_lastname,
        ac.account_email,
        ac.account_id
      FROM test_drive_appointments a
      JOIN inventory i ON a.inv_id = i.inv_id
      JOIN account ac ON a.account_id = ac.account_id
      ORDER BY
        CASE a.status
          WHEN 'pending'   THEN 1
          WHEN 'confirmed' THEN 2
          WHEN 'completed' THEN 3
          WHEN 'cancelled' THEN 4
        END,
        a.appointment_date ASC,
        a.appointment_time ASC`
        const result = await pool.query(sql)
        return result.rows
    } catch (error) {
        console.error("getAllAppointments error:", error)
        return []
    }
}

/* *****************************
 * Get a single appointment by ID
 * *************************** */
async function getAppointmentById(appointment_id) {
    try {
        const sql = `
      SELECT
        a.*,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        ac.account_firstname,
        ac.account_lastname,
        ac.account_email
      FROM test_drive_appointments a
      JOIN inventory i ON a.inv_id = i.inv_id
      JOIN account ac ON a.account_id = ac.account_id
      WHERE a.appointment_id = $1`
        const result = await pool.query(sql, [appointment_id])
        return result.rows[0]
    } catch (error) {
        console.error("getAppointmentById error:", error)
        return null
    }
}

/* *****************************
 * Update appointment status
 * *************************** */
async function updateAppointmentStatus(appointment_id, new_status, cancellation_reason = null) {
    try {
        const sql = `
      UPDATE test_drive_appointments
      SET status = $1,
          cancellation_reason = $2,
          updated_at = NOW()
      WHERE appointment_id = $3
      RETURNING *`
        const result = await pool.query(sql, [new_status, cancellation_reason, appointment_id])
        return result.rows[0]
    } catch (error) {
        console.error("updateAppointmentStatus error:", error)
        return null
    }
}

/* *****************************
 * Cancel all OTHER pending appointments for the same vehicle + date + time
 * Called when an Employee confirms one appointment
 * *************************** */
async function cancelConflictingPending(inv_id, appointment_date, appointment_time, confirmed_appointment_id) {
    try {
        const sql = `
      UPDATE test_drive_appointments
      SET status = 'cancelled',
          cancellation_reason = 'Time slot filled by another booking.',
          updated_at = NOW()
      WHERE inv_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND appointment_id != $4
        AND status = 'pending'
      RETURNING *`
        const result = await pool.query(sql, [inv_id, appointment_date, appointment_time, confirmed_appointment_id])
        return result.rows
    } catch (error) {
        console.error("cancelConflictingPending error:", error)
        return []
    }
}

/* *****************************
 * Check if a CONFIRMED appointment already exists for a vehicle + date + time
 * Used during form submission validation
 * *************************** */
async function checkConfirmedConflict(inv_id, appointment_date, appointment_time) {
    try {
        const sql = `
      SELECT appointment_id FROM test_drive_appointments
      WHERE inv_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND status = 'confirmed'`
        const result = await pool.query(sql, [inv_id, appointment_date, appointment_time])
        return result.rowCount
    } catch (error) {
        console.error("checkConfirmedConflict error:", error)
        return 0
    }
}

/* *****************************
 * Check if a client already has an appointment at the same date + time
 * Prevents one client from double-booking themselves
 * *************************** */
async function checkClientTimeConflict(account_id, appointment_date, appointment_time) {
    try {
        const sql = `
      SELECT appointment_id FROM test_drive_appointments
      WHERE account_id = $1
        AND appointment_date = $2
        AND appointment_time = $3
        AND status IN ('pending', 'confirmed')`
        const result = await pool.query(sql, [account_id, appointment_date, appointment_time])
        return result.rowCount
    } catch (error) {
        console.error("checkClientTimeConflict error:", error)
        return 0
    }
}

/* *****************************
 * Hard delete an appointment (Admin only)
 * *************************** */
async function deleteAppointment(appointment_id) {
    try {
        const sql = `DELETE FROM test_drive_appointments WHERE appointment_id = $1`
        const result = await pool.query(sql, [appointment_id])
        return result.rowCount
    } catch (error) {
        console.error("deleteAppointment error:", error)
        return 0
    }
}

module.exports = {
    createAppointment,
    getAppointmentsByAccount,
    getAllAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    cancelConflictingPending,
    checkConfirmedConflict,
    checkClientTimeConflict,
    deleteAppointment,
}
