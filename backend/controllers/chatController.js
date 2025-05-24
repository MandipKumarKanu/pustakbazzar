const Message = require('../models/Message');
const User = require('../models/User');
const Book = require('../models/Book');
const asyncHandler = require('express-async-handler');
const { createNotification } = require('../services/notificationService'); // Added

// @desc    Send a new message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, bookId, content } = req.body;
  const senderId = req.user.id;

  if (!receiverId || !content) {
    res.status(400);
    throw new Error('ReceiverId and content are required');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error('Receiver not found');
  }

  if (bookId) {
    const book = await Book.findById(bookId);
    if (!book) {
      res.status(404);
      throw new Error('Book not found');
    }
  }

  const message = await Message.create({
    senderId,
    receiverId,
    bookId,
    content,
  });

  // Populate sender, receiver, and book details for the emitted message
  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name email profile') // Adjust fields as needed
    .populate('receiverId', 'name email profile')
    .populate('bookId', 'title images');

  // Emit the new message to the receiver via Socket.IO
  const io = req.app.get('io');
  if (io && populatedMessage) {
    // Emit to receiver's room
    io.to(receiverId.toString()).emit('newMessage', populatedMessage);
    console.log(`Emitted 'newMessage' to user room: ${receiverId.toString()}`);

    // Emit to sender's room for multi-device sync
    io.to(senderId.toString()).emit('newMessage', populatedMessage);
    console.log(`Emitted 'newMessage' to sender room: ${senderId.toString()} for sync.`);

    // Create notification for the receiver
    const senderName = populatedMessage.senderId?.name || 'User'; // Use 'User' as a generic fallback
    const bookTitle = populatedMessage.bookId?.title;
    
    // This is the message for the in-app notification
    let inAppNotifMessage = `New message from ${senderName}`;
    if (bookTitle) {
      inAppNotifMessage += ` about "${bookTitle}"`;
    }
    inAppNotifMessage += `: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`;


    // Details for the email template
    const emailRelatedEntityDetails = {
        entityType: 'Chat',
        entityId: populatedMessage._id, // Using message ID, or could be chat room ID
        senderName: senderName,
        messagePreview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        bookTitle: bookTitle,
        // Pass original sender ID for chat link generation, assuming `senderId` is the ID string from req.user.id
        originalSenderId: senderId.toString(), 
        bookId: bookId // Pass bookId for chat link generation
    };

    await createNotification(
      io,
      receiverId.toString(),
      'new_message',
      inAppNotifMessage, // Concise message for in-app notification
      emailRelatedEntityDetails // Enriched details for email
    );

  } else {
    console.log('Socket.IO instance or populatedMessage not available for chat message emission/notification.');
  }

  res.status(201).json(populatedMessage);
});

// @desc    Get chat history with another user
// @route   GET /api/chat/history/:otherUserId
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;
  const { bookId, page = 1, limit = 20 } = req.query;

  const query = {
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  };

  if (bookId) {
    query.bookId = bookId;
  }

  const messages = await Message.find(query)
    .sort({ timestamp: -1 }) // Newest first
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .populate('bookId', 'title');

  res.status(200).json(messages);
});

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find all messages involving the current user
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .populate('senderId', 'name')
    .populate('receiverId', 'name')
    .populate('bookId', 'title')
    .sort({ timestamp: -1 });

  const conversationsMap = new Map();

  for (const message of messages) {
    const otherUser =
      message.senderId._id.toString() === userId
        ? message.receiverId
        : message.senderId;

    if (!otherUser) continue; // Should not happen with populated fields

    const otherUserId = otherUser._id.toString();

    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, {
        otherUserId: otherUser._id,
        otherUserName: otherUser.name,
        lastMessage: message.content,
        lastMessageTimestamp: message.timestamp,
        unreadCount: 0,
        bookId: message.bookId ? message.bookId._id : null,
        bookTitle: message.bookId ? message.bookId.title : null,
      });
    }

    const conversation = conversationsMap.get(otherUserId);

    // Update last message if this one is newer (should be due to sort, but as a safeguard)
    if (message.timestamp > conversation.lastMessageTimestamp) {
      conversation.lastMessage = message.content;
      conversation.lastMessageTimestamp = message.timestamp;
      if (message.bookId) {
        conversation.bookId = message.bookId._id;
        conversation.bookTitle = message.bookId.title;
      }
    }

    // Count unread messages
    if (message.receiverId._id.toString() === userId && !message.read) {
      conversation.unreadCount += 1;
    }
  }

  const conversations = Array.from(conversationsMap.values()).sort(
    (a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp
  );

  res.status(200).json(conversations);
});


// @desc    Mark messages as read
// @route   PUT /api/chat/messages/mark-as-read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { senderId, bookId } = req.body; // This is the other user's ID
  const receiverId = req.user.id; // Current user is the receiver of these messages

  if (!senderId) {
    res.status(400);
    throw new Error('senderId is required');
  }

  const updateQuery = {
    senderId: senderId,
    receiverId: receiverId,
    read: false,
  };

  if (bookId) {
    updateQuery.bookId = bookId;
  }

  const updateResult = await Message.updateMany(
    updateQuery,
    { $set: { read: true } }
  );

  // Emit event that messages were read
  const io = req.app.get('io');
  if (io) {
    const senderSocketId = req.app.get('userSockets')?.[senderId.toString()];
    if (senderSocketId) {
      io.to(senderSocketId).emit('messagesRead', { readerId: receiverId, bookId: bookId });
      console.log(`Emitted messagesRead to ${senderId} for book ${bookId}`);
    }
     // Also emit to current user's other sockets that they've read the messages
    const currentUserSocketId = req.app.get('userSockets')?.[receiverId.toString()];
    if (currentUserSocketId) {
        io.to(receiverId.toString()).emit('messagesReadByMe', { otherUserId: senderId, bookId: bookId });
         console.log(`Emitted messagesReadByMe to current user ${receiverId} for other user ${senderId} and book ${bookId}`);
    }
  }

  res.status(200).json({ message: `${updateResult.modifiedCount} messages marked as read`, count: updateResult.modifiedCount });
});

module.exports = {
  sendMessage,
  getChatHistory,
  getConversations,
  markMessagesAsRead,
};
