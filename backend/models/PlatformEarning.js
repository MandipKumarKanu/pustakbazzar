const mongoose = require('mongoose');

const platformEarningSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexing for efficient reporting
platformEarningSchema.index({ date: 1 });
platformEarningSchema.index({ sellerId: 1 });

const PlatformEarning = mongoose.model(
  'PlatformEarning',
  platformEarningSchema
);

module.exports = PlatformEarning;
