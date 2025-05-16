const platformConfig = require('../config/platformConfig');

/**
 * Calculates platform fee and seller earnings based on book price
 * Uses a flat 10% fee across all transactions
 */
const calculatePlatformFee = (bookPrice, quantity = 1) => {
  // Get the fixed platform fee percentage (10%)
  const feePercentage = platformConfig.platformFeePercentage;
  
  // Calculate fee and earnings
  const platformFee = bookPrice * feePercentage * quantity;
  const sellerEarnings = bookPrice * (1 - feePercentage) * quantity;
  
  return {
    feePercentage,
    platformFee,
    sellerEarnings
  };
};

/**
 * Records the platform fee earnings in the database for reporting
 */
const recordPlatformFee = async (transactionId, orderId, platformFee, sellerId) => {
  try {
    const PlatformEarning = require('../models/PlatformEarning');
    
    await PlatformEarning.create({
      transactionId,
      orderId,
      platformFee,
      sellerId,
      date: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error recording platform fee:', error);
    return false;
  }
};

module.exports = {
  calculatePlatformFee,
  recordPlatformFee
};