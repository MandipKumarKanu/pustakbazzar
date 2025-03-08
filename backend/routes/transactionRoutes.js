const express = require("express");
const router = express.Router();
const {
  initiateTransaction,
  verifyTransaction,
} = require("../controllers/transactionController");
const validateKhaltiKey = require("../middleware/validateKhaltiKey");

router.post("/initiate", validateKhaltiKey, initiateTransaction);
router.post("/verify", validateKhaltiKey, verifyTransaction);

module.exports = router;
