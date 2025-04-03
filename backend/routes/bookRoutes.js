const express = require("express");
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getBooksBySeller,
  searchBooks,
  filterBooks,
  incrementBookViews,
  getWeeklyTopBooks,
  getMonthlyTopBooks,
  toggleFeaturedBook,
  getFeaturedBooks,
  // myBook
} = require("../controllers/bookController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBook);
router.post("/get", getAllBooks);
router.get("/weeklytop", getWeeklyTopBooks);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooks);
router.get("/:id", getBookById);
router.patch("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.get("/category/:categoryId", getBooksByCategory);
router.get("/seller/:sellerId", getBooksBySeller);
router.get("/filter", filterBooks);
router.patch("/inc/:id", incrementBookViews);
router.patch("/toggle/:id", toggleFeaturedBook);

module.exports = router;
