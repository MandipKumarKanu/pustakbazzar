const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersForUser,
  approveRejectOrder,
  cancelOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, createOrder);
router.get("/user/orders", authMiddleware, getOrdersForUser);
router.put("/seller/order/approve-reject", authMiddleware, approveRejectOrder);
router.put("/user/order/cancel", authMiddleware, cancelOrder);

module.exports = router;
