const express = require('express');
const router = express.Router();
const {
  createRequest, getRequests, updateRequestStatus
} = require('../controllers/hospitalRequestController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/', verifyToken, requireRole('patient'), createRequest);
router.get('/', verifyToken, getRequests);
router.put('/:id/status', verifyToken, requireRole('admin', 'hospital_staff'), updateRequestStatus);

module.exports = router;
