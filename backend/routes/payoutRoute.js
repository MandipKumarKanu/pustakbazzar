const express = require("express");
const router = express.Router();
const {
  createPayout,
  getAllPayouts,
  getMyEarnings,
  getPayoutById,
} = require("../controllers/payoutController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware(["admin"]), createPayout);
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllPayouts);
router.get("/earnings", authMiddleware, getMyEarnings);
router.get("/:sellerId", authMiddleware, getPayoutById);


module.exports = router;
