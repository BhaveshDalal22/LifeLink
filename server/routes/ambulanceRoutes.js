const express = require('express');
const router = express.Router();
const {
  getAmbulances, getAvailableAmbulances, getNearbyAmbulances,
  createAmbulanceRequest, getAmbulanceRequests, updateAmbulanceRequestStatus,
  updateAmbulanceLocation, updateAmbulanceStatus
} = require('../controllers/ambulanceController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Ambulance fleet
router.get('/ambulances', verifyToken, getAmbulances);
router.get('/ambulances/available', verifyToken, getAvailableAmbulances);
router.get('/ambulances/nearby', verifyToken, getNearbyAmbulances);
router.put('/ambulances/:id/location', verifyToken, requireRole('ambulance_driver', 'admin'), updateAmbulanceLocation);
router.put('/ambulances/:id/status', verifyToken, requireRole('ambulance_driver', 'admin'), updateAmbulanceStatus);

// Ambulance trip requests
router.post('/ambulance-requests', verifyToken, requireRole('patient'), createAmbulanceRequest);
router.get('/ambulance-requests', verifyToken, getAmbulanceRequests);
router.put('/ambulance-requests/:id/status', verifyToken, requireRole('ambulance_driver', 'patient', 'admin'), updateAmbulanceRequestStatus);

module.exports = router;
