const pool = require('../config/db');

const BASE_SELECT = `
  SELECT h.hospital_id, h.name, h.address, h.area, h.city, h.state,
         h.latitude, h.longitude, h.contact, h.status, h.verified,
         h.staff_user_id, h.created_at,
         hc.total_beds, hc.available_beds, hc.icu_total, hc.icu_available,
         hc.emergency_beds_total, hc.emergency_beds_available,
         hc.ventilators_total, hc.ventilators_available, hc.last_updated
  FROM hospitals h
  LEFT JOIN hospital_capacity hc ON hc.hospital_id = h.hospital_id
`;

async function attachSpecializations(hospitals) {
  if (hospitals.length === 0) return hospitals;
  const ids = hospitals.map((h) => h.hospital_id);
  const [rows] = await pool.query(
    `SELECT hospital_id, specialization FROM hospital_specializations WHERE hospital_id IN (?)`,
    [ids]
  );
  const map = {};
  rows.forEach((r) => {
    if (!map[r.hospital_id]) map[r.hospital_id] = [];
    map[r.hospital_id].push(r.specialization);
  });
  return hospitals.map((h) => ({ ...h, specializations: map[h.hospital_id] || [] }));
}

const Hospital = {
  async findAll({ verifiedOnly = false } = {}) {
    let query = BASE_SELECT;
    const params = [];
    if (verifiedOnly) {
      query += ' WHERE h.verified = TRUE';
    }
    query += ' ORDER BY h.name ASC';
    const [rows] = await pool.query(query, params);
    return attachSpecializations(rows);
  },

  async findById(hospitalId) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE h.hospital_id = ?`, [hospitalId]);
    if (rows.length === 0) return null;
    const [withSpec] = await attachSpecializations(rows);
    return withSpec;
  },

  async findByStaffUserId(staffUserId) {
    const [rows] = await pool.query(`${BASE_SELECT} WHERE h.staff_user_id = ?`, [staffUserId]);
    if (rows.length === 0) return null;
    const [withSpec] = await attachSpecializations(rows);
    return withSpec;
  },

  async create({ name, address, area, city, state, latitude, longitude, contact, staffUserId }) {
    const [result] = await pool.query(
      `INSERT INTO hospitals (name, address, area, city, state, latitude, longitude, contact, staff_user_id, verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [name, address, area, city, state, latitude, longitude, contact, staffUserId || null]
    );
    return result.insertId;
  },

  async update(hospitalId, fields) {
    const allowed = ['name', 'address', 'area', 'city', 'state', 'latitude', 'longitude', 'contact', 'status', 'staff_user_id'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k));
    if (keys.length === 0) return;
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    await pool.query(`UPDATE hospitals SET ${setClause} WHERE hospital_id = ?`, [...values, hospitalId]);
  },

  async setVerified(hospitalId, verified) {
    await pool.query('UPDATE hospitals SET verified = ? WHERE hospital_id = ?', [verified, hospitalId]);
  },

  async deleteById(hospitalId) {
    await pool.query('DELETE FROM hospitals WHERE hospital_id = ?', [hospitalId]);
  },

  async addSpecializations(hospitalId, specializations = []) {
    if (specializations.length === 0) return;
    const values = specializations.map((s) => [hospitalId, s]);
    await pool.query('INSERT INTO hospital_specializations (hospital_id, specialization) VALUES ?', [values]);
  },

  async replaceSpecializations(hospitalId, specializations = []) {
    await pool.query('DELETE FROM hospital_specializations WHERE hospital_id = ?', [hospitalId]);
    await this.addSpecializations(hospitalId, specializations);
  },

  async createCapacity(hospitalId, capacity) {
    const {
      totalBeds = 0, availableBeds = 0, icuTotal = 0, icuAvailable = 0,
      emergencyBedsTotal = 0, emergencyBedsAvailable = 0, ventilatorsTotal = 0, ventilatorsAvailable = 0
    } = capacity;
    await pool.query(
      `INSERT INTO hospital_capacity
       (hospital_id, total_beds, available_beds, icu_total, icu_available,
        emergency_beds_total, emergency_beds_available, ventilators_total, ventilators_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [hospitalId, totalBeds, availableBeds, icuTotal, icuAvailable,
        emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable]
    );
  },

  async updateCapacity(hospitalId, capacity) {
    const {
      totalBeds, availableBeds, icuTotal, icuAvailable,
      emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable
    } = capacity;
    await pool.query(
      `UPDATE hospital_capacity SET
        total_beds = ?, available_beds = ?, icu_total = ?, icu_available = ?,
        emergency_beds_total = ?, emergency_beds_available = ?,
        ventilators_total = ?, ventilators_available = ?
       WHERE hospital_id = ?`,
      [totalBeds, availableBeds, icuTotal, icuAvailable,
        emergencyBedsTotal, emergencyBedsAvailable, ventilatorsTotal, ventilatorsAvailable, hospitalId]
    );
  },

  async getCapacity(hospitalId) {
    const [rows] = await pool.query('SELECT * FROM hospital_capacity WHERE hospital_id = ?', [hospitalId]);
    return rows[0] || null;
  }
};

module.exports = Hospital;
