const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    conversations: [
      {
        user: {
          type: String,
          required: true,
        },
        ai: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        filters: {
          type: Object,
          default: null,
        },
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

SessionSchema.index(
  { lastActive: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

module.exports = mongoose.model('Session', SessionSchema);
