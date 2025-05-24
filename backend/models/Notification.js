const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'new_message',
      'order_update',
      'donation_status',
      'seller_status',
      'book_approved',
      'book_rejected',
      'general',
      // Future types can be added here
    ],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedEntity: {
    entityType: { type: String }, // e.g., 'Chat', 'Order', 'Donation', 'Book', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying of user's unread notifications
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
