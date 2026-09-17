const express = require('express');
const router = express.Router();
const {
  getHospitals, getNearbyHospitals, getHospitalById,
  createHospital, updateHospital, deleteHospital,
  getCapacity, updateCapacity
} = require('../controllers/hospitalController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public browsing (Find Hospital page)
router.get('/nearby', getNearbyHospitals);
router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.get('/:id/capacity', getCapacity);

// Admin-managed hospital records
router.post('/', verifyToken, requireRole('admin'), createHospital);
router.put('/:id', verifyToken, requireRole('admin', 'hospital_staff'), updateHospital);
router.delete('/:id', verifyToken, requireRole('admin'), deleteHospital);

// Hospital staff (own hospital) or admin
router.put('/:id/capacity', verifyToken, requireRole('admin', 'hospital_staff'), updateCapacity);

module.exports = router;
