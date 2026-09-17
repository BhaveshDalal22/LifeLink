const pool = require('../config/db');

const Notification = {
  async create({ userId, message }) {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [userId, message]
    );
    return result.insertId;
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return rows;
  },

  async markRead(notificationId, userId) {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
  }
};

module.exports = Notification;
