// Create this file if it doesn't exist

const express = require("express");
const router = express.Router();
const { getSellerFeeInfo } = require("../controllers/sellerController");
const authMiddleWare = require("../middleware/authMiddleware");

// const { isAuthenticated, isSeller } = require("../middlewares/auth");

// Fee info route
router.get("/fee-info",authMiddleWare, getSellerFeeInfo);

module.exports = router;
