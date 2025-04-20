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
const optionalAuthMiddleware = require("../middleware/optionalAuthmiddleware");
const { getRecommendations } = require("../controllers/recommendation");

router.post("/", authMiddleware, createBook);
router.post("/get", getAllBooks);
router.get("/weeklytop", getWeeklyTopBooks);
router.get("/featured", getFeaturedBooks);
router.get("/search", searchBooks);
router.get("/:id",optionalAuthMiddleware, getBookById);
router.patch("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);
router.get("/category/:categoryId", getBooksByCategory);
router.get("/seller/:sellerId", getBooksBySeller);
router.get("/filter", filterBooks);
router.patch("/inc/:id", incrementBookViews);
router.patch("/toggle/:id", toggleFeaturedBook);

router.get("/recommendations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await getRecommendations(userId);

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations." });
  }
});

module.exports = router;
