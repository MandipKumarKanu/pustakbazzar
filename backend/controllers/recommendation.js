const Book = require('../models/Book');

const publicRecommendation = async (req, res) => {
  const { categories = [] } = req.body;

  try {
    if (!Array.isArray(categories)) {
      return res.status(400).json({
        message: "'categories' must be an array",
      });
    }

    let recommendedBooks;

    if (categories.length > 0) {
      recommendedBooks = await Book.find({
        category: { $in: categories }, 
        status: "available",
      }).limit(10);
    } else {
      recommendedBooks = await Book.find({
        status: "available",
      }).limit(10);
    }

    if (recommendedBooks.length === 0) {
      return res.status(404).json({
        message: "No books found matching the given categories",
        data: [],
      });
    }

    res.status(200).json({
      message: categories.length > 0 
        ? "Recommendations fetched successfully" 
        : "Random recommendations fetched successfully",
      data: recommendedBooks,
    });
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({
      message: "Error fetching recommendations",
      error: err.message,
    });
  }
};

module.exports = {
  publicRecommendation,
};
