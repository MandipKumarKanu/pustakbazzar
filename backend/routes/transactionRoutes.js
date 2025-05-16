const express = require("express");
const router = express.Router();
const {
  // initiateTransaction,
  // verifyTransaction,
  handleStripeWebhook,
  verifyKhaltiPayment,
} = require("../controllers/transactionController");
const validateKhaltiKey = require("../middleware/validateKhaltiKey");
const authMiddleWare = require("../middleware/authMiddleware");

// Regular routes with authentication
// router.post("/initiate", validateKhaltiKey, initiateTransaction);
router.post("/verify", validateKhaltiKey, verifyKhaltiPayment);

// Export the router
module.exports = router;
