const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    markedPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length >= 3;
        },
        message: "At least 3 images are required.",
      },
    },
    condition: {
      type: String,
      enum: ["new", "good", "acceptable"],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "sold", "donated"],
      default: "available",
    },
    forDonation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
