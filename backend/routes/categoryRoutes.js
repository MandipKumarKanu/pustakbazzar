const express = require("express");
const router = express.Router();
const {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getAllCategory);
router.post("/", createCategory);
router.patch("/", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
