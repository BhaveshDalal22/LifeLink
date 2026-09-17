const express = require('express');
const router = express.Router();
const { getNotifications, markRead } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getNotifications);
router.put('/:id/read', verifyToken, markRead);

module.exports = router;
