const express = require('express');
const router = express.Router();
const {
  createEmergency, getEmergencies, getEmergencyById, updateEmergencyStatus
} = require('../controllers/emergencyController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('patient'), createEmergency);
router.get('/', verifyToken, getEmergencies);
router.get('/:id', verifyToken, getEmergencyById);
router.put('/:id/status', verifyToken, updateEmergencyStatus);

module.exports = router;
