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
  getAllBooksForAdmin,
  getAuthors
  // myBook
} = require("../controllers/bookController");

const authMiddleware = require("../middleware/authMiddleware");
// const optionalAuthMiddleware = require("../middleware/optionalAuthmiddleware");
const { publicRecommendation } = require("../controllers/recommendation");
const userMiddleware = require("../middleware/optionalAuthmiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, createBook);
router.post("/get", getAllBooks);
router.get("/weeklytop", getWeeklyTopBooks);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooks);
router.get("/category/:categoryId", getBooksByCategory);
router.get("/admin", authMiddleware, roleMiddleware(["admin"]), getAllBooksForAdmin);
router.get("/get-author",  getAuthors);
router.get("/:id", userMiddleware, getBookById);
router.patch("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.get("/seller/:sellerId", getBooksBySeller);
router.get("/filter", filterBooks);
router.patch("/inc/:id", incrementBookViews);
router.patch("/toggle/:id", toggleFeaturedBook);
router.post("/recommendations",  publicRecommendation);

module.exports = router;
