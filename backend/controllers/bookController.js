const Book = require("../models/Book");
const User = require("../models/User");
const addCustomClassesToHtml = require("../utils/addCustomClass");
const Donation = require("../models/Donation");
const levenshtein = require("fast-levenshtein");
const mongoose = require("mongoose");

const createBook = async (req, res) => {
  const {
    title,
    description,
    author,
    category,
    markedPrice,
    sellingPrice,
    images,
    condition,
    forDonation,
    publishYear,
    edition,
    language,
  } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!forDonation && user.isSeller.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Only approved sellers can upload books for sale." });
    }

    const styledDesc = addCustomClassesToHtml(description);
    const book = new Book({
      title,
      description: styledDesc,
      author,
      category,
      markedPrice: forDonation ? 0 : markedPrice,
      sellingPrice: forDonation ? 0 : sellingPrice,
      images,
      condition,
      addedBy: req.user._id,
      forDonation,
      publishYear,
      edition,
      language,
      // status,
    });

    await book.save();

    if (forDonation) {
      const donation = new Donation({
        book: book._id,
        donor: req.user._id,
        status: "pending",
      });
      await donation.save();
    }

    res.status(201).json({
      book,
      message: forDonation
        ? "Book added for donation."
        : "Book added for sell.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: "available", forDonation: false })
      .lean()
      .sort({ createdAt: -1 })
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName");
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch books." });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName");
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.status(200).json({ book });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book." });
  }
};

const updateBook = async (req, res) => {
  const {
    title,
    description,
    author,
    category,
    markedPrice,
    sellingPrice,
    images,
    condition,
    forDonation,
    publishYear,
    edition,
    language,
  } = req.body;

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    if (
      book.addedBy.toString() !== req.user._id.toString() &&
      req.user.profile.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this book." });
    }

    if (!forDonation && req.user.isSeller.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Only approved sellers can upload books for sale." });
    }

    const styledDesc = addCustomClassesToHtml(description);

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description: styledDesc,
        author,
        category,
        markedPrice: forDonation ? 0 : markedPrice,
        sellingPrice: forDonation ? 0 : sellingPrice,
        images,
        condition,
        addedBy: req.user._id,
        forDonation,
        publishYear,
        edition,
        language,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating book.", error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    if (
      book.addedBy.toString() !== req.user._id.toString() &&
      req.user.profile.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this book." });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting book." });
  }
};

const getBooksByCategory = async (req, res) => {
  try {
    const books = await Book.find({
      category: { $in: req?.params?.categoryId },
      status: "available",
      forDonation: false,
    })
      .lean()
      .populate("addedBy", "profile.userName");
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books." });
  }
};

const getBooksBySeller = async (req, res) => {
  try {
    const books = await Book.find({ addedBy: req.params.sellerId })
      .lean()
      .populate("category");
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: "Error fetching books." });
  }
};

const searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    // const limit = 5;

    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const searchTerm = query.toLowerCase();

    const books = await Book.find({
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { author: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .lean()
      .populate("category");
    // .limit(limit);

    if (books.length > 0) {
      return res.status(200).json({ books });
    }

    const allBooks = await Book.find().populate("category");

    const filteredBooks = allBooks.filter((book) => {
      const titleLower = book.title.toLowerCase();
      const authorLower = book.author.toLowerCase();

      if (titleLower.includes(searchTerm) || authorLower.includes(searchTerm)) {
        return true;
      }

      const titleWords = titleLower.split(/\s+/);
      for (const word of titleWords) {
        if (word.startsWith(searchTerm) || searchTerm.startsWith(word)) {
          return true;
        }
      }

      const authorWords = authorLower.split(/\s+/);
      for (const word of authorWords) {
        if (word.startsWith(searchTerm) || searchTerm.startsWith(word)) {
          return true;
        }
      }

      return false;
    });
    // .slice(0, limit);

    return res.status(200).json({ books: filteredBooks });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({ message: "Error searching books." });
  }
};

const filterBooks = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, condition } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.sellingPrice = {};
    if (minPrice) filter.sellingPrice.$gte = minPrice;
    if (maxPrice) filter.sellingPrice.$lte = maxPrice;
    if (condition) filter.condition = condition;

    const books = await Book.find(filter)
      .lean()
      .populate("category");
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: "Error filtering books." });
  }
};

const incrementBookViews = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID." });
    }

    const book = await Book.findByIdAndUpdate(
      bookId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.status(200).json({ views: book.views });
  } catch (error) {
    res.status(500).json({
      message: "Error incrementing book views.",
      error: error.message,
    });
  }
};

const getWeeklyTopBooks = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topBooks = await Book.find({
      createdAt: { $gte: oneWeekAgo },
      status: "available",
    })
      .lean()
      .sort({ views: -1 })
      .limit(6);

    res.status(200).json({ data: topBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyTopBooks = async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const topBooks = await Book.find({
      createdAt: { $gte: oneMonthAgo },
      status: "available",
    })
      .lean()
      .sort({ views: -1 })
      .limit(5);

    res.json({ data: topBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleFeaturedBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    book.isFeatured = !book.isFeatured;
    book.featuredDate = book.isFeatured ? new Date() : null;
    await book.save();

    res.status(201).json({
      message: `Book ${
        book.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: book,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFeaturedBooks = async (req, res) => {
  try {
    const featuredBooks = await Book.find({
      isFeatured: true,
      status: "available",
    })
      .lean()
      .sort({ featuredDate: -1 });

    res.status(200).json({ data: featuredBooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};