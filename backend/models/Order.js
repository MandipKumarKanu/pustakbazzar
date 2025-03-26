const mongoose = require("mongoose");

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String },
  province: { type: String, required: true },
  town: { type: String, required: true },
  landmark: { type: String },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const subOrderSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  books: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      price: {
        type: Number,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      sellerEarnings: {
        type: Number,
      },
    },
  ],
  shippingFee: {
    type: Number,
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
  },
  totalPrice: {
    type: Number,
  },
  shippingFee: {
    type: Number,
  },
  discount: {
    type: Number,
    default: 0,
  },
  netTotal: {
    type: Number,
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
    enum: ["credit", "khalti"],
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
  shippingAddress: {
    type: shippingAddressSchema, 
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
