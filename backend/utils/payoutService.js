const User = require('../models/User');

const initiatePayout = async (seller, amount) => {
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
  };
};

module.exports = { initiatePayout };
