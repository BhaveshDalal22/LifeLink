// MySQL connection pool configuration
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lifelink_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Quick connectivity check at startup (does not crash the app if it fails,
// but logs a clear warning so setup issues are easy to spot).
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('[DB] Connected to MySQL database:', process.env.DB_NAME || 'lifelink_db');
    conn.release();
  } catch (err) {
    console.error('[DB] Failed to connect to MySQL:', err.message);
    console.error('[DB] Check server/.env DB_* values and that MySQL is running.');
  }
}

testConnection();

module.exports = pool;
