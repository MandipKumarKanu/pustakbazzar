const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "approved";
    await user.save();

    res.status(200).json({ message: "Seller approved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "rejected";
    await user.save();

    res.status(200).json({ message: "Seller application rejected." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sellers = await User.find({ "isSeller.status": "approved" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalSellers = await User.countDocuments({ "isSeller.status": "approved" });

    res.status(200).json({
      sellers,
      pagination: {
        totalSellers,
        totalPages: Math.ceil(totalSellers / limitNum),
        currentPage: pageNum,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  approveSeller,
  rejectSeller,
  getApprovedSellers,
};