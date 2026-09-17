const pool = require('../config/db');

const BASE_SELECT = `
  SELECT a.ambulance_id, a.driver_id, a.ambulance_number, a.latitude, a.longitude,
         a.status, a.updated_at, u.name AS driver_name, u.phone AS driver_phone
  FROM ambulances a
  JOIN users u ON u.user_id = a.driver_id
`;

const Ambulance = {
  async findAll() {
    const [rows] = await pool.query(`${BASE_SELECT} ORDER BY a.ambulance_number ASC`);
    return rows;
  },

  async findAvailable() {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE a.status = 'Available'`);
    return rows;
  },

  async findById(ambulanceId) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE a.ambulance_id = ?`, [ambulanceId]);
    return rows[0] || null;
  },

  async findByDriverId(driverId) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE a.driver_id = ?`, [driverId]);
    return rows[0] || null;
  },

  async create({ driverId, ambulanceNumber, latitude, longitude }) {
    const [result] = await pool.query(
      `INSERT INTO ambulances (driver_id, ambulance_number, latitude, longitude, status)
       VALUES (?, ?, ?, ?, 'Offline')`,
      [driverId, ambulanceNumber, latitude || 12.9716, longitude || 77.5946]
    );
    return result.insertId;
  },

  async updateLocation(ambulanceId, latitude, longitude) {
    await pool.query('UPDATE ambulances SET latitude = ?, longitude = ? WHERE ambulance_id = ?', [
      latitude, longitude, ambulanceId
    ]);
  },

  async updateStatus(ambulanceId, status) {
    await pool.query('UPDATE ambulances SET status = ? WHERE ambulance_id = ?', [status, ambulanceId]);
  }
};

module.exports = Ambulance;
