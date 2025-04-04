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
    const { page = 1, limit = 10, minPrice, maxPrice } = req.query;

    const { order = {} } = req.body;

    const fetchLimit = Math.min(parseInt(limit, 10), 50);
    const skip = (parseInt(page, 10) - 1) * fetchLimit;

    // Base query to fetch only available books not marked for donation
    const query = { status: "available", forDonation: false };

    // Apply price filters if provided
    if (minPrice)
      query.sellingPrice = {
        ...query.sellingPrice,
        $gte: parseInt(minPrice, 10),
      };
    if (maxPrice)
      query.sellingPrice = {
        ...query.sellingPrice,
        $lte: parseInt(maxPrice, 10),
      };

    // Determine sorting criteria based on the `order` object
    const sortField = order.type === "price" ? "sellingPrice" : "createdAt";
    const sortOrder = order.order === "asc" ? 1 : -1;
    const sortCriteria = { [sortField]: sortOrder };

    // Fetch books with pagination
    const books = await Book.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(fetchLimit)
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName")
      .lean();

    // Get total count for pagination
    const totalBooks = await Book.countDocuments(query);

    return res.status(200).json({
      books,
      totalPages: Math.ceil(totalBooks / fetchLimit),
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
      .sort({ createdAt: -1 })
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
    const { query, title, author, publishYear } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const maxDistance = req.query.distance ? parseInt(req.query.distance) : 2;

    // Check if at least one search parameter is provided
    if (!query && !title && !author && !publishYear) {
      return res
        .status(400)
        .json({ message: "At least one search parameter is required." });
    }

    // First attempt: Use MongoDB query with specified fields
    const mongoQuery = {};

    // Build MongoDB query based on provided parameters
    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ];
    } else {
      // If specific fields are provided instead of general query
      const conditions = [];

      if (title) {
        conditions.push({ title: { $regex: title, $options: "i" } });
      }

      if (author) {
        conditions.push({ author: { $regex: author, $options: "i" } });
      }

      if (publishYear) {
        // Assuming publishYear is stored as a number in the database
        conditions.push({ publishYear: parseInt(publishYear) });
      }

      if (conditions.length > 0) {
        mongoQuery.$and = conditions;
      }
    }

    const books = await Book.find(mongoQuery).lean().populate("category");

    if (books.length > 0) {
      return res.status(200).json({ books: books.slice(0, limit) });
    }

    // Second attempt: More advanced filtering with JS
    const allBooks = await Book.find().lean().populate("category");

    const filteredBooks = allBooks.filter((book) => {
      // If no specific parameters are provided, return false
      if (!query && !title && !author && !publishYear) {
        return false;
      }

      // Match each provided parameter
      let titleMatch = true;
      let authorMatch = true;
      let queryMatch = true;
      let yearMatch = true;

      if (title) {
        const titleLower = book.title.toLowerCase();
        const searchTitle = title.toLowerCase();
        titleMatch =
          titleLower.includes(searchTitle) ||
          titleLower
            .split(/\s+/)
            .some(
              (word) =>
                word.startsWith(searchTitle) || searchTitle.startsWith(word)
            );
      }

      if (author) {
        const authorLower = book.author.toLowerCase();
        const searchAuthor = author.toLowerCase();
        authorMatch =
          authorLower.includes(searchAuthor) ||
          authorLower
            .split(/\s+/)
            .some(
              (word) =>
                word.startsWith(searchAuthor) || searchAuthor.startsWith(word)
            );
      }

      if (publishYear) {
        yearMatch = book.publishYear === parseInt(publishYear);
      }

      if (query) {
        const queryLower = query.toLowerCase();
        const titleLower = book.title.toLowerCase();
        const authorLower = book.author.toLowerCase();

        const titleQueryMatch =
          titleLower.includes(queryLower) ||
          titleLower
            .split(/\s+/)
            .some(
              (word) =>
                word.startsWith(queryLower) || queryLower.startsWith(word)
            );

        const authorQueryMatch =
          authorLower.includes(queryLower) ||
          authorLower
            .split(/\s+/)
            .some(
              (word) =>
                word.startsWith(queryLower) || queryLower.startsWith(word)
            );

        queryMatch = titleQueryMatch || authorQueryMatch;
      }

      // All provided parameters must match
      return titleMatch && authorMatch && queryMatch && yearMatch;
    });

    if (filteredBooks.length > 0) {
      return res.status(200).json({ books: filteredBooks.slice(0, limit) });
    }

    // Third attempt: Levenshtein fuzzy search
    // Only use fuzzy search for text fields, not for year
    const fuzzySearchNeeded = query || title || author;

    if (!fuzzySearchNeeded) {
      return res.status(200).json({ books: [] });
    }

    const fuzzyResults = allBooks
      .map((book) => {
        let minDistance = Infinity;
        let matchField = "";

        // Calculate distances for query parameter
        if (query) {
          const queryLower = query.toLowerCase();

          // Check title distance
          const titleDistance = Math.min(
            ...book.title
              .toLowerCase()
              .split(/\s+/)
              .map((word) => levenshtein.get(word, queryLower))
          );

          // Check author distance
          const authorDistance = Math.min(
            ...book.author
              .toLowerCase()
              .split(/\s+/)
              .map((word) => levenshtein.get(word, queryLower))
          );

          const queryMinDistance = Math.min(titleDistance, authorDistance);

          if (queryMinDistance < minDistance) {
            minDistance = queryMinDistance;
            matchField = titleDistance <= authorDistance ? "title" : "author";
          }
        }

        // Calculate distance for title parameter
        if (title) {
          const titleLower = title.toLowerCase();
          const titleDistance = Math.min(
            ...book.title
              .toLowerCase()
              .split(/\s+/)
              .map((word) => levenshtein.get(word, titleLower))
          );

          if (titleDistance < minDistance) {
            minDistance = titleDistance;
            matchField = "title";
          }
        }

        // Calculate distance for author parameter
        if (author) {
          const authorLower = author.toLowerCase();
          const authorDistance = Math.min(
            ...book.author
              .toLowerCase()
              .split(/\s+/)
              .map((word) => levenshtein.get(word, authorLower))
          );

          if (authorDistance < minDistance) {
            minDistance = authorDistance;
            matchField = "author";
          }
        }

        // Check publishYear if provided - exact match only, no fuzzy matching for numbers
        if (publishYear && book.publishYear !== parseInt(publishYear)) {
          return { book, distance: Infinity, field: "" }; // No match for year
        }

        return {
          book,
          distance: minDistance,
          field: matchField,
        };
      })
      .filter((result) => result.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    const fuzzyBooks = fuzzyResults.map((result) => ({
      ...result.book,
      _fuzzyMatch: {
        distance: result.distance,
        field: result.field,
      },
    }));

    return res.status(200).json({ books: fuzzyBooks.slice(0, limit) });
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

    const books = await Book.find(filter).lean().populate("category");
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
