const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrdersForUser,
  getOrdersForSeller,
  getOrdersForAdmin,
  approveRejectOrder,
  cancelOrder,
  updateOrderStatus,
  createOrderWithStripe
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, createOrder);
router.post("/stripe-checkout", authMiddleware, createOrderWithStripe);
router.get("/", authMiddleware, getOrdersForUser);
router.get("/seller", authMiddleware, getOrdersForSeller);
router.patch(
  "/seller/order/approve-reject",
  authMiddleware,
  approveRejectOrder
);
router.patch("/user/order/cancel", authMiddleware, cancelOrder);
router.patch(
  "/update-status",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateOrderStatus
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOrdersForAdmin
);

module.exports = router;
