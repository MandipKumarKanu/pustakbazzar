const Donation = require("../models/Donation");
const User = require("../models/User");
const Book = require("../models/Book");
const handleError = require("../utils/errorHandler");

const createDonation = async (req, res) => {
  try {
    const { bookId, message } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: "Book not found." });
    if (book.addedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only donate books you own." });
    }

    const donation = new Donation({
      book: bookId,
      donor: req.user._id,
      message,
      status: "pending",
    });
    await donation.save();

    await User.findByIdAndUpdate(req.user._id, { $push: { donated: bookId } });

    res.status(201).json({ message: "Donation request submitted.", donation });
  } catch (error) {
    handleError(res, error, "Error creating donation.");
  }
};

const getLatestDonations = async (req, res) => {
  let limit = 9;

  try {
    const donations = await Donation.find({
      status: { $in: ["approved", "completed"] },
    })
      .lean()
      .populate("book")
      .populate(
        "donor",
        "profile.userName profile.email profile.profileImg donated profile.firstName profile.lastName"
      )
      .sort({ createdAt: -1 })
      .limit(limit);

    // const totalDonations = await Donation.countDocuments();

    res.status(200).json({
      donations,
    });
  } catch (error) {
    handleError(res, error, "Error fetching latest donations.");
  }
};

const getAllDonors = async (req, res) => {
  try {
    const donors = await User.find({ donated: { $exists: true, $ne: [] } })
      .select("profile.userName profile.email profile.phNo")
      .populate("donated", "title");

    res.status(200).json({ donors });
  } catch (error) {
    handleError(res, error, "Error fetching donors.");
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    if (req.user.profile.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update donation status." });
    }

    const { donationId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid donation status." });
    }

    const donation = await Donation.findById(donationId);
    if (!donation)
      return res.status(404).json({ message: "Donation not found." });

    donation.status = status;
    await donation.save();

    res.status(200).json({ message: "Donation status updated.", donation });
  } catch (error) {
    handleError(res, error, "Error updating donation status.");
  }
};

const getAllDonations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const donations = await Donation.find()
      .populate("book")
      .populate("donor", "profile.userName profile.email")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalDonations = await Donation.countDocuments();

    res.status(200).json({
      donations,
      pagination: {
        totalDonations,
        totalPages: Math.ceil(totalDonations / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    handleError(res, error, "Error fetching donations.");
  }
};

const getUserDonations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate("book")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalDonations = await Donation.countDocuments({
      donor: req.user._id,
    });

    res.status(200).json({
      donations,
      pagination: {
        totalDonations,
        totalPages: Math.ceil(totalDonations / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    handleError(res, error, "Error fetching user donations.");
  }
};

const deleteDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);

    if (!donation)
      return res.status(404).json({ message: "Donation not found." });

    if (
      donation.donor.toString() !== req.user._id.toString() &&
      req.user.profile.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this donation." });
    }

    await donation.deleteOne();
    res.status(200).json({ message: "Donation deleted successfully." });
  } catch (error) {
    handleError(res, error, "Error deleting donation.");
  }
};

const getPendingDonations = async (req, res) => {
  try {
    // const { page = 1, limit = 10 } = req.query;

    const pendingDonations = await Donation.find({ status: "pending" })
      .populate("book")
      .populate("donor", "profile.userName profile.email")
      .sort({ createdAt: -1 });
    // .skip((page - 1) * limit)
    // .limit(limit);

    const totalPendingDonations = await Donation.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      donations: pendingDonations,
      // pagination: {
      //   totalPendingDonations,
      //   totalPages: Math.ceil(totalPendingDonations / limit),
      //   currentPage: parseInt(page),
      // },
    });
  } catch (error) {
    handleError(res, error, "Error fetching pending donations.");
  }
};

module.exports = {
  createDonation,
  getLatestDonations,
  getAllDonors,
  updateDonationStatus,
  getAllDonations,
  getUserDonations,
  deleteDonation,
  getPendingDonations,
};
