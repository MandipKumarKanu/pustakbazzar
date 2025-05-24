const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get notifications for the authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Use .lean() for faster queries if not modifying docs

  const totalNotifications = await Notification.countDocuments({ user: userId });
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  res.status(200).json({
    notifications,
    currentPage: page,
    totalPages: Math.ceil(totalNotifications / limit),
    totalNotifications,
    unreadCount,
  });
});

// @desc    Mark a single notification as read
// @route   POST /api/notifications/:id/mark-read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  const notification = await Notification.findOne({ _id: notificationId, user: userId });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found or not authorized');
  }

  if (notification.isRead) {
    // Optionally, you can just return success if already read
    return res.status(200).json({ message: 'Notification already marked as read', notification });
  }

  notification.isRead = true;
  await notification.save();

  // Emit an event to inform client about read status update for this specific notification
  const io = req.app.get('io');
    if (io) {
        io.to(userId.toString()).emit('notificationRead', { notificationId: notification._id, isRead: true });
        // Also update the general unread count for the user
        const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
        io.to(userId.toString()).emit('unreadNotificationCount', { count: unreadCount });
    }

  res.status(200).json({ message: 'Notification marked as read', notification });
});

// @desc    Mark all unread notifications as read
// @route   POST /api/notifications/mark-all-read
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );

  // Emit an event to inform client about read status update for all notifications
   const io = req.app.get('io');
    if (io) {
        io.to(userId.toString()).emit('allNotificationsRead', { userId });
        // Also update the general unread count for the user
        io.to(userId.toString()).emit('unreadNotificationCount', { count: 0 });
    }


  res.status(200).json({ message: `${result.modifiedCount} notifications marked as read` });
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
