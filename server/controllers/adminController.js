const pool = require('../config/db');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Emergency = require('../models/Emergency');
const { asyncHandler } = require('../utils/asyncHandler');

// GET /api/admin/statistics
const getStatistics = asyncHandler(async (req, res) => {
  const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
  const [[{ totalHospitals }]] = await pool.query('SELECT COUNT(*) AS totalHospitals FROM hospitals');
  const [[{ verifiedHospitals }]] = await pool.query('SELECT COUNT(*) AS verifiedHospitals FROM hospitals WHERE verified = TRUE');
  const [[{ totalAmbulances }]] = await pool.query('SELECT COUNT(*) AS totalAmbulances FROM ambulances');
  const [[{ availableAmbulances }]] = await pool.query(`SELECT COUNT(*) AS availableAmbulances FROM ambulances WHERE status = 'Available'`);
  const { active: activeEmergencies, completed: completedEmergencies } = await Emergency.countByStatusGroup();

  const emergenciesByType = await Emergency.countByType();
  const emergenciesByStatus = await Emergency.countByStatus();
  const usersByRole = await User.countByRole();

  const [hospitalUtilization] = await pool.query(`
    SELECT h.hospital_id, h.name,
           hc.total_beds, hc.available_beds,
           ROUND(((hc.total_beds - hc.available_beds) / NULLIF(hc.total_beds,0)) * 100, 1) AS utilizationPercent
    FROM hospitals h
    JOIN hospital_capacity hc ON hc.hospital_id = h.hospital_id
    WHERE h.verified = TRUE
  `);

  const [ambulanceUtilization] = await pool.query(`
    SELECT status, COUNT(*) AS count FROM ambulances GROUP BY status
  `);

  res.json({
    statistics: {
      totalUsers, totalHospitals, verifiedHospitals, totalAmbulances,
      availableAmbulances, activeEmergencies, completedEmergencies
    },
    charts: {
      emergenciesByType, emergenciesByStatus, usersByRole,
      hospitalUtilization, ambulanceUtilization
    }
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json({ users });
});

// GET /api/admin/hospitals
const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.findAll({ verifiedOnly: false });
  res.json({ hospitals });
});

// GET /api/admin/emergencies
const getEmergencies = asyncHandler(async (req, res) => {
  const emergencies = await Emergency.findAll({ status: req.query.status });
  res.json({ emergencies });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await User.deleteById(req.params.id);
  res.json({ message: 'User deleted.' });
});

module.exports = { getStatistics, getUsers, getHospitals, getEmergencies, deleteUser };
