const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["initiated", "completed", "failed"],
      default: "initiated",
    },
    // Make payment IDs optional based on payment method
    khaltiPaymentId: {
      type: String,
      required: function() {
        return this.paymentMethod === 'khalti';
      }
    },
    stripeSessionId: {
      type: String,
      required: function() {
        return this.paymentMethod === 'stripe';
      }
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "stripe", "credit"],
      required: true
    },
    paymentDetails: {
      type: Object,
    },
    khaltiResponse: {
      type: Object,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
