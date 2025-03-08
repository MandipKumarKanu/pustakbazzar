const express = require("express");
const router = express.Router();
const { createPayout,getPayout } = require("../controllers/payoutController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createPayout);
router.get("/", authMiddleware, getPayout);

module.exports = router;
