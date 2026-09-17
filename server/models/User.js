const pool = require('../config/db');

const User = {
  async create({ name, email, passwordHash, role, phone }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, phone || null]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, role, phone, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  async countByRole() {
    const [rows] = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    return rows;
  },

  async deleteById(userId) {
    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
  }
};

module.exports = User;
