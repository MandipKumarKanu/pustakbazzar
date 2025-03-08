const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orders: [
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      books: [
        {
          bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
          price: { type: Number, required: true },
          sellerEarnings: { type: Number, required: true },
        },
      ],
      deliveryPrice: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  ],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalPrice: { type: Number, required: true },
  deliveryPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  netTotal: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
  payment: {
    type: String,
    enum: ["credit", "khalti"],
    default: "credit",
  },
});

module.exports = mongoose.model("Order", orderSchema);
