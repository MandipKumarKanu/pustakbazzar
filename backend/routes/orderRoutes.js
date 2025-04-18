const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrdersForUser,
  getOrdersForSeller,
  getOrdersForAdmin,
  approveRejectOrder,
  cancelOrder,
  updateOrderStatus
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");

router.post("/", authMiddleware, createOrder);
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

router.get("/admin", authMiddleware, getOrdersForAdmin);

module.exports = router;
