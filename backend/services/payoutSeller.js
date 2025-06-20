const User = require('../models/User');
const { initiatePayout } = require('../utils/payoutService');

const payoutSeller = async (sellerId) => {
  const seller = await User.findById(sellerId);
  if (!seller) throw new Error('Seller not found');

  if (seller.balance <= 0) throw new Error('No balance to payout');

  const payoutAmount = seller.balance;

  const payoutResponse = await initiatePayout(seller, payoutAmount);

  if (payoutResponse.success) {
    seller.earning += payoutAmount;
    seller.balance = 0;

    seller.payoutHistory.push({
      payoutAmount,
      transactionId: payoutResponse.transactionId,
      status: 'success',
    });

    await seller.save();
    return {
      message: 'Payout successful',
      transactionId: payoutResponse.transactionId,
    };
  } else {
    throw new Error('Payout failed');
  }
};

const getAllSellersWithBalance = async () => {
  const sellers = await User.find({
    balance: { $gt: 0 },
    'isSeller.status': 'approved',
  });

  return sellers.map((seller) => ({
    sellerId: seller._id,
    name: `${seller.profile.firstName} ${seller.profile.lastName}`,
    userName: seller.profile.userName,
    balance: seller.balance,
    totalEarning: seller.earning,
    payoutHistory: seller.payoutHistory,
  }));
};

const getSellerPayoutDetails = async (sellerId) => {
  const seller = await User.findById(sellerId);
  if (!seller) throw new Error('Seller not found');

  return {
    sellerId: seller._id,
    name: `${seller.profile.firstName} ${seller.profile.lastName}`,
    balance: seller.balance,
    totalEarning: seller.earning,
    payoutHistory: seller.payoutHistory,
  };
};

module.exports = {
  payoutSeller,
  getAllSellersWithBalance,
  getSellerPayoutDetails,
};
