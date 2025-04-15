const express = require("express");
const router = express.Router();
const { getAllStats } = require("../controllers/statsController");
const authMiddleWare = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// const { verifyToken, isAdmin } = require("../middleware/auth");

router.get("/stats", authMiddleWare, roleMiddleware(["admin"]), getAllStats);

module.exports = router;
