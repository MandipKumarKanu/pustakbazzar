const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  removeSellerItemsFromCart
} = require("../controllers/CartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addItemToCart);
router.get("/", authMiddleware, getCart);
router.post("/remove", authMiddleware, removeItemFromCart);
router.post("/clear", authMiddleware, clearCart);
router.post("/:sellerId", authMiddleware, removeSellerItemsFromCart);

module.exports = router;