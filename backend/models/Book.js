const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    publishYear: { type: String, trim: true },
    bookLanguage: { type: String },
    edition: { type: String },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isbn: { type: String, trim: true },
    category: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ],
    markedPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      required: true,
      // validate: {
      //   validator: function (arr) {
      //     return arr.length >= 3;
      //   },
      //   message: "At least 3 images are required.",
      // },
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'acceptable'],
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'donated', 'pending'],
      default: 'available',
    },
    forDonation: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    featuredDate: { type: Date },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Indexes for common query patterns

// For getAllBooks and general browsing/sorting
bookSchema.index({ status: 1, forDonation: 1, sellingPrice: 1 });
bookSchema.index({ status: 1, forDonation: 1, createdAt: -1 });

// For getBooksByCategory
bookSchema.index({ category: 1, status: 1, forDonation: 1, createdAt: -1 });

// For getBooksBySeller
bookSchema.index({ addedBy: 1 });

// For getFeaturedBooks
bookSchema.index({ isFeatured: 1, status: 1, featuredDate: -1 });

// For getWeeklyTopBooks / getMonthlyTopBooks
bookSchema.index({ status: 1, views: -1 });
bookSchema.index({ createdAt: -1 }); // General recency sorting

// For filtering options
bookSchema.index({ condition: 1 });
bookSchema.index({ bookLanguage: 1 });
bookSchema.index({ isbn: 1 }); // For exact ISBN matches / prefix regex
bookSchema.index({ publishYear: 1 });
// sellingPrice is already part of a compound index, but a standalone one might be used by optimizer for other queries.
// However, to avoid over-indexing, let's rely on the compound one for now.

module.exports = mongoose.model('Book', bookSchema);
