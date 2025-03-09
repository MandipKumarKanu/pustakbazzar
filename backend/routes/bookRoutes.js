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
} = require("../controllers/bookController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBook);
router.get("/", getAllBooks);
router.get("/search", searchBooks);
router.get("/:id", getBookById);
router.patch("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.get("/category/:categoryId", getBooksByCategory);
router.get("/seller/:sellerId", getBooksBySeller);
router.get("/filter", filterBooks);

module.exports = router;
