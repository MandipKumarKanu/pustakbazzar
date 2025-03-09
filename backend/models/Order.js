const mongoose = require("mongoose");

const subOrderSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      sellerEarnings: {
        type: Number,
        required: true,
      },
    },
  ],
  deliveryPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  trackingNumber: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  orders: [subOrderSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  netTotal: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "partially approved", "confirmed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  payment: {
    type: String,
    enum: ["credit", "khalti", "paypal"],
    default: "credit",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  khaltiPaymentId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Order", orderSchema);
