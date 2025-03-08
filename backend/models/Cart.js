const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carts: [
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      books: [
        {
          bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
          price: { type: Number, required: true },
        },
      ],
      deliveryPrice: { type: Number, required: true },
    },
  ],
  discount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Cart", cartSchema);
