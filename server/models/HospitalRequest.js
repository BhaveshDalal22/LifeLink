const pool = require('../config/db');

const HospitalRequest = {
  async create({ emergencyId, hospitalId }) {
    const [result] = await pool.query(
      `INSERT INTO hospital_requests (emergency_id, hospital_id, status) VALUES (?, ?, 'Pending')`,
      [emergencyId, hospitalId]
    );
    return result.insertId;
  },

  async findById(requestId) {
    const [rows] = await pool.query(
      `SELECT hr.*, e.patient_name, e.emergency_type, e.severity, e.required_resources,
              e.latitude, e.longitude, e.additional_info, e.user_id AS patient_user_id
       FROM hospital_requests hr
       JOIN emergencies e ON e.emergency_id = hr.emergency_id
       WHERE hr.request_id = ?`,
      [requestId]
    );
    return rows[0] || null;
  },

  async findByHospital(hospitalId) {
    const [rows] = await pool.query(
      `SELECT hr.*, e.patient_name, e.emergency_type, e.severity, e.required_resources,
              e.latitude, e.longitude, e.additional_info, e.user_id AS patient_user_id
       FROM hospital_requests hr
       JOIN emergencies e ON e.emergency_id = hr.emergency_id
       WHERE hr.hospital_id = ?
       ORDER BY hr.requested_at DESC`,
      [hospitalId]
    );
    return rows;
  },

  async findByEmergency(emergencyId) {
    const [rows] = await pool.query(
      `SELECT hr.*, h.name AS hospital_name, h.area, h.contact
       FROM hospital_requests hr
       JOIN hospitals h ON h.hospital_id = hr.hospital_id
       WHERE hr.emergency_id = ?
       ORDER BY hr.requested_at DESC`,
      [emergencyId]
    );
    return rows;
  },

  async updateStatus(requestId, status) {
    await pool.query('UPDATE hospital_requests SET status = ? WHERE request_id = ?', [status, requestId]);
  }
};

module.exports = HospitalRequest;
