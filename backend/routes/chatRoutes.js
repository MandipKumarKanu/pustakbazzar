const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getConversations,
  markMessagesAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chat/send
// @desc    Send a new message
// @access  Private
router.post('/send', protect, sendMessage);

// @route   GET /api/chat/history/:otherUserId
// @desc    Get chat history with another user
// @access  Private
router.get('/history/:otherUserId', protect, getChatHistory);

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the current user
// @access  Private
router.get('/conversations', protect, getConversations);

// @route   PUT /api/chat/messages/mark-as-read
// @desc    Mark messages as read
// @access  Private
router.put('/messages/mark-as-read', protect, markMessagesAsRead);

module.exports = router;
