// Add this endpoint

const getSellerFeeInfo = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id);

    if (!seller || !seller.isSeller) {
      return res.status(403).json({
        success: false,
        message: 'User is not a seller',
      });
    }

    // Get platform fee from config (flat 10%)
    const platformFeePercentage =
      require('../config/platformConfig').platformFeePercentage;

    // Calculate fee on different price points for demonstration
    const examplePrices = [100, 500, 1000, 2000, 5000];
    const examples = examplePrices.map((price) => ({
      bookPrice: price,
      platformFee: price * platformFeePercentage,
      sellerEarnings: price * (1 - platformFeePercentage),
    }));

    // Get total platform fees paid by this seller in the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    const PlatformEarning = require('../models/PlatformEarning');
    const feesStats = await PlatformEarning.aggregate([
      {
        $match: {
          sellerId: mongoose.Types.ObjectId(req.user._id),
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$platformFee' },
          totalTransactions: { $sum: 1 },
          averageFee: { $avg: '$platformFee' },
        },
      },
    ]).then(
      (results) =>
        results[0] || { totalFees: 0, totalTransactions: 0, averageFee: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        platformFeePercentage: platformFeePercentage * 100, // Convert to percentage format
        examples,
        totalFeesLastMonth: feesStats.totalFees,
        totalTransactionsLastMonth: feesStats.totalTransactions,
        averageFeePerTransaction: feesStats.averageFee,
      },
    });
  } catch (error) {
    console.error('Error fetching fee info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee information',
      error: error.message,
    });
  }
};

module.exports = {
  getSellerFeeInfo,
};

// Add to exports
