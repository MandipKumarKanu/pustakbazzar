const express = require("express");
const router = express.Router();
const { addItemToCart, getCart } = require("../controllers/CartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/cart/add", authMiddleware, addItemToCart);
router.get("/cart", authMiddleware, getCart);

module.exports = router;
