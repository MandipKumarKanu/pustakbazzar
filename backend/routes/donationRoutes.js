const express = require("express");
const {
  createDonation,
  getUserDonations,
  getLatestDonations,
  getAllDonors,
  updateDonationStatus,
  deleteDonation,
  getAllDonations
} = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/donate", authMiddleware, createDonation);
router.get("/my-donations", authMiddleware, getUserDonations);
router.get("/all-donations", authMiddleware, getAllDonations);
router.get("/latest-donations", getLatestDonations);
router.get("/donors", getAllDonors);
router.patch(
  "/update-status/:donationId",
  authMiddleware,
  updateDonationStatus
);
router.delete("/delete/:donationId", authMiddleware, deleteDonation);

module.exports = router;
