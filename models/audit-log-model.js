const pool = require("../database/")

/* *****************************
 * Insert a new audit log entry
 * Called automatically after every status change
 * *************************** */
async function insertLog(
    appointment_id,
    account_id,
    account_firstname,
    account_lastname,
    account_type,
    action_type,
    previous_status,
    new_status,
    vehicle_label,
    client_name
) {
    try {
        const sql = `
      INSERT INTO appointment_audit_log
        (appointment_id, account_id, account_firstname, account_lastname,
         account_type, action_type, previous_status, new_status,
         vehicle_label, client_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`
        const result = await pool.query(sql, [
            appointment_id,
            account_id,
            account_firstname,
            account_lastname,
            account_type,
            action_type,
            previous_status,
            new_status,
            vehicle_label,
            client_name,
        ])
        return result.rows[0]
    } catch (error) {
        console.error("insertLog error:", error)
        return null
    }
}

/* *****************************
 * Get all audit log entries (Admin view)
 * Most recent first
 * *************************** */
async function getAllLogs() {
    try {
        const sql = `
      SELECT
        log_id,
        appointment_id,
        account_firstname,
        account_lastname,
        account_type,
        action_type,
        previous_status,
        new_status,
        vehicle_label,
        client_name,
        log_timestamp
      FROM appointment_audit_log
      ORDER BY log_timestamp DESC`
        const result = await pool.query(sql)
        return result.rows
    } catch (error) {
        console.error("getAllLogs error:", error)
        return []
    }
}

/* *****************************
 * Get audit log entries for a single appointment
 * *************************** */
async function getLogsByAppointment(appointment_id) {
    try {
        const sql = `
      SELECT *
      FROM appointment_audit_log
      WHERE appointment_id = $1
      ORDER BY log_timestamp ASC`
        const result = await pool.query(sql, [appointment_id])
        return result.rows
    } catch (error) {
        console.error("getLogsByAppointment error:", error)
        return []
    }
}

module.exports = { insertLog, getAllLogs, getLogsByAppointment }
