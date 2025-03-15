const express = require("express");
const router = express.Router();
const {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", getAllCategory);
router.post("/", authMiddleware, roleMiddleware(["admin"]), createCategory);
router.patch("/", authMiddleware, roleMiddleware(["admin"]), updateCategory);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteCategory
);

module.exports = router;
