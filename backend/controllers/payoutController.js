const { payoutSeller } = require("../services/payoutSeller");

const createPayout = async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    await payoutSeller(sellerId);

    res.status(200).json({ message: "Payout initiated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const getPayout = async (req, res) => {
  try {
    const payoutDetails = await getAllSellersPayoutDue();

    res.json({
      message: "Sellers' payout details fetched successfully",
      payoutDetails,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPayout,getPayout };
