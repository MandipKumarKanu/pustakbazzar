const Book = require('../models/Book');
const { recordVisit } = require('./statsController');

const publicRecommendation = async (req, res) => {
  try {
    const { categories = [] } = req.body;
    await recordVisit();

    if (categories != null && !Array.isArray(categories)) {
      return res.status(400).json({
        message: "'categories' must be an array when provided",
      });
    }

    let recommendedBooks;

    if (Array.isArray(categories) && categories.length > 0) {
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      recommendedBooks = await Book.aggregate([
        { $match: { category: randomCategory, status: 'available' } },
        { $sample: { size: 12 } },
      ]);

      if (recommendedBooks.length === 0) {
        return res.status(404).json({
          message: `No books found in category '${randomCategory}'`,
          data: [],
        });
      }

      return res.status(200).json({
        message: `Random recommendations fetched for category '${randomCategory}'`,
        data: recommendedBooks,
      });
    }

    recommendedBooks = await Book.aggregate([
      { $match: { status: 'available' } },
      { $sample: { size: 12 } },
    ]);

    if (recommendedBooks.length === 0) {
      return res.status(404).json({
        message: 'No available books found',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Random recommendations fetched successfully',
      data: recommendedBooks,
    });
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return res.status(500).json({
      message: 'Error fetching recommendations',
      error: err.message,
    });
  }
};

module.exports = {
  publicRecommendation,
};
