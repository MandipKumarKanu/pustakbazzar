const User = require("../models/User");
const {
  payoutSeller,
  getAllSellersWithBalance,
  getSellerPayoutDetails,
} = require("../services/payoutSeller");

const createPayout = async (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId)
      return res.status(400).json({ error: "Seller ID is required" });

    const result = await payoutSeller(sellerId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllPayouts = async (req, res) => {
  try {
    const data = await getAllSellersWithBalance();
    res.status(200).json({ message: "Sellers fetched", sellers: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayoutById = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (req.user._id.toString() === sellerId) {
      const user = await User.findById(sellerId);
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.status(200).json({
        message: "Your payout details fetched successfully",
        data: {
          balance: user.balance,
          earning: user.earning,
          payoutHistory: user.payoutHistory,
        },
      });
    }

    if (req.user.profile.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized. Only admins can fetch other users' payout details." });
    }

    const data = await getSellerPayoutDetails(sellerId);
    res.status(200).json({ message: "Seller payout fetched", data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyEarnings = async (req, res) => {
  try {
    const userId = req.user._id; 
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "Earnings and balance fetched successfully",
      data: {
        balance: user.balance,
        earning: user.earning,
      },
    });
  } catch (error) {
    console.error("Error fetching earnings:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPayout, getAllPayouts, getPayoutById,getMyEarnings };
