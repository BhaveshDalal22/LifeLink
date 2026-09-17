const express = require('express');
const router = express.Router();
const {
  getStatistics, getUsers, getHospitals, getEmergencies, deleteUser
} = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('admin'));

router.get('/statistics', getStatistics);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/hospitals', getHospitals);
router.get('/emergencies', getEmergencies);

module.exports = router;
