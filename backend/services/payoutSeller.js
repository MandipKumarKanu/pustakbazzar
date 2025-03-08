const User = require("../models/User");
const { initiatePayout } = require("../utils/payoutService");

const payoutSeller = async (sellerId) => {
  try {
    const seller = await User.findById(sellerId);
    if (!seller) {
      throw new Error("Seller not found");
    }

    const payoutAmount = seller.balance;
    const payoutResponse = await initiatePayout(seller, payoutAmount);
    if (payoutResponse.success) {
      seller.balance = 0;
      seller.earning += payoutAmount;
      await seller.save();
      console.log("Payout successful");
    } else {
      console.error("Payout failed");
    }
  } catch (error) {
    console.error("Payout error:", error.message);
  }
};

const getAllSellersPayoutDue = async () => {
  try {
    const sellers = await User.find({});

    const payoutDetails = sellers.map((seller) => {
      const totalPaidOut = seller.payoutHistory.reduce(
        (acc, payout) => acc + payout.payoutAmount,
        0
      );

      const remainingPayout = seller.balance - totalPaidOut;

      return {
        sellerId: seller._id,
        name: seller.name,
        totalBalance: seller.balance,
        totalPaidOut,
        remainingPayout,
      };
    });

    return payoutDetails;
  } catch (error) {
    console.error("Error getting all seller payout due:", error.message);
    throw error;
  }
};

module.exports = { payoutSeller, getAllSellersPayoutDue };
