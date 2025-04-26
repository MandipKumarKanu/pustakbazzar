const express = require("express");
const router = express.Router();
const {
  createPayout,
  getAllPayouts,
  getMyEarnings,
  getPayoutById,
  getSellerPayoutHistory,
} = require("../controllers/payoutController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware(["admin"]), createPayout);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllPayouts);
router.get("/earnings", authMiddleware, getMyEarnings);
router.get("/:sellerId", authMiddleware, getPayoutById);
router.get("/:sellerId/history", authMiddleware, getSellerPayoutHistory);
router.get("/history", authMiddleware, getSellerPayoutHistory); 

module.exports = router;
