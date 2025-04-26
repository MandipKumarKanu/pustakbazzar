const Book = require("../models/Book");
const User = require("../models/User");
const addCustomClassesToHtml = require("../utils/addCustomClass");
const Donation = require("../models/Donation");
const levenshtein = require("fast-levenshtein");
const mongoose = require("mongoose");
// const { recordEvent } = require("../controllers/statsController");
const {
  recordSale,
  recordDonation,
  recordBookAdded,
  recordUserSignup,
  recordVisit,
} = require("./statsController");

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

    console.log("Language:", language);
    console.log("Edition:", edition);

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

      user.donated.push(book._id);
      await user.save();
      await recordDonation();
    } else {
      user.sold.push(book._id);
      await user.save();
      await recordBookAdded();
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

    const query = { status: "available", forDonation: false };

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

    const sortField = order.type === "price" ? "sellingPrice" : "createdAt";
    const sortOrder = order.order === "asc" ? 1 : -1;
    const sortCriteria = { [sortField]: sortOrder };

    const books = await Book.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(fetchLimit)
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName")
      .lean();

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

    const categories = Array.isArray(book.category)
      ? book.category
      : [book.category];

    if (req.user) {
      const uid = req.user._id || req.user[0]?.id;
      if (categories && categories.length > 0) {
        const categoryId = categories[0]._id;
        await User.findByIdAndUpdate(
          uid,
          {
            $addToSet: { interest: categoryId },
          },
          { new: true }
        );
      } else {
        console.log("No categories found for the book.");
      }
    } else {
      console.log("User not found");
    }

    res.status(200).json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
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
    const cateId = req?.params?.categoryId || "all";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    let books, totalBooks;

    if (cateId === "all") {
      totalBooks = await Book.countDocuments({
        status: "available",
        forDonation: false,
      });
      books = await Book.find({
        status: "available",
        forDonation: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .populate("addedBy", "profile.userName");
    } else {
      totalBooks = await Book.countDocuments({
        category: { $in: [cateId] },
        status: "available",
        forDonation: false,
      });
      books = await Book.find({
        category: { $in: [cateId] },
        status: "available",
        forDonation: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .populate("addedBy", "profile.userName");
    }
    res.status(200).json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: page,
      totalBooks,
    });
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

    if (!query && !title && !author && !publishYear) {
      return res
        .status(400)
        .json({ message: "At least one search parameter is required." });
    }

    const mongoQuery = {};

    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { author: { $regex: query, $options: "i" } },
      ];
    } else {
      const conditions = [];

      if (title) {
        conditions.push({ title: { $regex: title, $options: "i" } });
      }

      if (author) {
        conditions.push({ author: { $regex: author, $options: "i" } });
      }

      if (publishYear) {
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

    const allBooks = await Book.find().lean().populate("category");

    const filteredBooks = allBooks.filter((book) => {
      if (!query && !title && !author && !publishYear) {
        return false;
      }

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

      return titleMatch && authorMatch && queryMatch && yearMatch;
    });

    if (filteredBooks.length > 0) {
      return res.status(200).json({ books: filteredBooks.slice(0, limit) });
    }

    const fuzzySearchNeeded = query || title || author;

    if (!fuzzySearchNeeded) {
      return res.status(200).json({ books: [] });
    }

    const fuzzyResults = allBooks
      .map((book) => {
        let minDistance = Infinity;
        let matchField = "";

        if (query) {
          const queryLower = query.toLowerCase();

          const titleDistance = Math.min(
            ...book.title
              .toLowerCase()
              .split(/\s+/)
              .map((word) => levenshtein.get(word, queryLower))
          );

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

        if (publishYear && book.publishYear !== parseInt(publishYear)) {
          return { book, distance: Infinity, field: "" };
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
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 60);

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
