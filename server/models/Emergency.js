const pool = require('../config/db');

const Emergency = {
  async create({ userId, patientName, emergencyType, severity, requiredResources, latitude, longitude, additionalInfo }) {
    const [result] = await pool.query(
      `INSERT INTO emergencies
       (user_id, patient_name, emergency_type, severity, required_resources, latitude, longitude, additional_info, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Reported')`,
      [userId, patientName, emergencyType, severity, requiredResources, latitude, longitude, additionalInfo || null]
    );
    return result.insertId;
  },

  async findById(emergencyId) {
    const [rows] = await pool.query('SELECT * FROM emergencies WHERE emergency_id = ?', [emergencyId]);
    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM emergencies WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async findAll({ status } = {}) {
    let query = 'SELECT e.*, u.name AS reporter_name FROM emergencies e JOIN users u ON u.user_id = e.user_id';
    const params = [];
    if (status) {
      query += ' WHERE e.status = ?';
      params.push(status);
    }
    query += ' ORDER BY e.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async updateStatus(emergencyId, status) {
    await pool.query('UPDATE emergencies SET status = ? WHERE emergency_id = ?', [status, emergencyId]);
  },

  async countByStatusGroup() {
    const [active] = await pool.query(
      `SELECT COUNT(*) AS count FROM emergencies WHERE status NOT IN ('Completed','Cancelled')`
    );
    const [completed] = await pool.query(
      `SELECT COUNT(*) AS count FROM emergencies WHERE status = 'Completed'`
    );
    return { active: active[0].count, completed: completed[0].count };
  },

  async countByType() {
    const [rows] = await pool.query(
      'SELECT emergency_type, COUNT(*) AS count FROM emergencies GROUP BY emergency_type'
    );
    return rows;
  },

  async countByStatus() {
    const [rows] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM emergencies GROUP BY status'
    );
    return rows;
  }
};

module.exports = Emergency;
