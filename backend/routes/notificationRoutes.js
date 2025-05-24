const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get notifications for the authenticated user
// @access  Private
router.get('/', protect, getNotifications);

// @route   POST /api/notifications/:id/mark-read
// @desc    Mark a single notification as read
// @access  Private
router.post('/:id/mark-read', protect, markNotificationAsRead);

// @route   POST /api/notifications/mark-all-read
// @desc    Mark all unread notifications as read
// @access  Private
router.post('/mark-all-read', protect, markAllNotificationsAsRead);

module.exports = router;
