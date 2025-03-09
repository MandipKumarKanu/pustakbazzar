const express = require("express");
const router = express.Router();
const {
  saveForLater,
  getSavedForLater,
  removeFromSavedForLater,
} = require("../controllers/savedForLaterController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:id", authMiddleware, saveForLater);
router.delete("/:id", authMiddleware, removeFromSavedForLater);
router.get("/", authMiddleware, getSavedForLater);

module.exports = router;
