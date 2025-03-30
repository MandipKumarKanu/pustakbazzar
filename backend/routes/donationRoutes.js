const express = require("express");
const {
  createDonation,
  getUserDonations,
  getLatestDonations,
  getAllDonors,
  updateDonationStatus,
  deleteDonation,
  getAllDonations,
  getPendingDonations
} = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/donate", authMiddleware, createDonation);
router.get("/my-donations", authMiddleware, getUserDonations);
router.get("/pending", authMiddleware, getPendingDonations);
router.get("/all-donations", getAllDonations);
router.get("/latest-donations", getLatestDonations);
router.get("/donors", getAllDonors);
router.patch(
  "/update-status/:donationId",
  authMiddleware,
  updateDonationStatus
);
router.delete("/delete/:donationId", authMiddleware, deleteDonation);

module.exports = router;
