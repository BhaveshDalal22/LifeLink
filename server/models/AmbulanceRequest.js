const pool = require('../config/db');

const AmbulanceRequest = {
  async create({ emergencyId, ambulanceId }) {
    const [result] = await pool.query(
      `INSERT INTO ambulance_requests (emergency_id, ambulance_id, status) VALUES (?, ?, 'Requested')`,
      [emergencyId, ambulanceId]
    );
    return result.insertId;
  },

  async findById(ambulanceRequestId) {
    const [rows] = await pool.query(
      `SELECT ar.*, e.patient_name, e.emergency_type, e.severity, e.latitude AS pickup_lat,
              e.longitude AS pickup_lng, e.user_id AS patient_user_id
       FROM ambulance_requests ar
       JOIN emergencies e ON e.emergency_id = ar.emergency_id
       WHERE ar.ambulance_request_id = ?`,
      [ambulanceRequestId]
    );
    return rows[0] || null;
  },

  async findByAmbulance(ambulanceId) {
    const [rows] = await pool.query(
      `SELECT ar.*, e.patient_name, e.emergency_type, e.severity, e.latitude AS pickup_lat,
              e.longitude AS pickup_lng, e.additional_info, e.user_id AS patient_user_id
       FROM ambulance_requests ar
       JOIN emergencies e ON e.emergency_id = ar.emergency_id
       WHERE ar.ambulance_id = ?
       ORDER BY ar.requested_at DESC`,
      [ambulanceId]
    );
    return rows;
  },

  async findActiveByAmbulance(ambulanceId) {
    const [rows] = await pool.query(
      `SELECT ar.*, e.patient_name, e.emergency_type, e.severity, e.latitude AS pickup_lat,
              e.longitude AS pickup_lng, e.additional_info, e.user_id AS patient_user_id
       FROM ambulance_requests ar
       JOIN emergencies e ON e.emergency_id = ar.emergency_id
       WHERE ar.ambulance_id = ? AND ar.status NOT IN ('Completed','Cancelled')
       ORDER BY ar.requested_at DESC LIMIT 1`,
      [ambulanceId]
    );
    return rows[0] || null;
  },

  async findByEmergency(emergencyId) {
    const [rows] = await pool.query(
      `SELECT ar.*, a.ambulance_number, a.latitude, a.longitude, u.name AS driver_name, u.phone AS driver_phone
       FROM ambulance_requests ar
       JOIN ambulances a ON a.ambulance_id = ar.ambulance_id
       JOIN users u ON u.user_id = a.driver_id
       WHERE ar.emergency_id = ?
       ORDER BY ar.requested_at DESC`,
      [emergencyId]
    );
    return rows;
  },

  async updateStatus(ambulanceRequestId, status) {
    await pool.query('UPDATE ambulance_requests SET status = ? WHERE ambulance_request_id = ?', [
      status, ambulanceRequestId
    ]);
  }
};

module.exports = AmbulanceRequest;
