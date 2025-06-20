const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  totalDonations: {
    type: Number,
    default: 0,
  },
  booksAdded: {
    type: Number,
    default: 0,
  },
  usersCreated: {
    type: Number,
    default: 0,
  },
  visits: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Stats', StatsSchema);
