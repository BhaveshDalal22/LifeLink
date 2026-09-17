const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/asyncHandler');

// GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.findByUser(req.user.user_id);
  res.json({ notifications });
});

// PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.markRead(req.params.id, req.user.user_id);
  res.json({ message: 'Notification marked as read.' });
});

module.exports = { getNotifications, markRead };
