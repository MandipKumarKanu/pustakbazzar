const express = require("express");
const router = express.Router();
const {
  saveForLater,
  getSavedForLater,
  removeFromSavedForLater,
} = require("../controllers/savedForLaterController");

router.post("/", saveForLater);
router.get("/", getSavedForLater);
router.delete("/", removeFromSavedForLater);

module.exports = router;
