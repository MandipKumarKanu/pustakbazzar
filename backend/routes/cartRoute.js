const express = require("express");
const router = express.Router();
const {
  addItemToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  removeSellerItemsFromCart,
  isInCart
} = require("../controllers/CartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add/:bookId", authMiddleware, addItemToCart);
router.get("/incart/:bookId", authMiddleware, isInCart);
router.get("/", authMiddleware, getCart);
router.post("/remove/:bookId", authMiddleware, removeItemFromCart);
router.post("/clear", authMiddleware, clearCart);
router.post("/seller/:sellerId", authMiddleware, removeSellerItemsFromCart);

module.exports = router;