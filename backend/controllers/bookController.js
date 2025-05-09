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

    // console.log("Language:", language);
    // console.log("Edition:", edition);

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
      bookLanguage: language, // Changed from language to bookLanguage
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

    const bookData = book.toObject();
    if (bookData.language) {
      bookData.bookLanguage = bookData.language;
      delete bookData.language;
    }

    res.status(200).json({ book: bookData });
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
    bookLanguage,
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
        bookLanguage: bookLanguage,
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

    const user = await User.findById(book.addedBy);

    if (user) {
      if (book.forDonation) {
        user.donated = user.donated.filter(
          (donatedId) => donatedId.toString() !== book._id.toString()
        );
      } else {
        user.sold = user.sold.filter(
          (soldId) => soldId.toString() !== book._id.toString()
        );
      }

      await user.save();
    }

    if (book.forDonation) {
      await Donation.deleteOne({ book: book._id });
    }

    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      message: "Error deleting book.",
      error: error.message,
    });
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
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const maxDistance = req.query.distance ? parseInt(req.query.distance) : 2;

    // Validate that at least one search parameter exists
    if (!query && !title && !author && !publishYear) {
      return res
        .status(400)
        .json({ message: "At least one search parameter is required." });
    }

    // Base query to only include available books that aren't for donation
    const baseQuery = {
      status: "available",
      forDonation: false,
    };

    // STEP 1: Try exact matching with MongoDB query
    const mongoQuery = buildMongoQuery(query, title, author, publishYear);
    // Combine with baseQuery
    const fullQuery = { ...baseQuery, ...mongoQuery };

    // Count total matches for pagination
    const totalExactMatches = await Book.countDocuments(fullQuery);

    const exactMatches = await Book.find(fullQuery)
      .lean()
      .populate("category")
      .populate("addedBy", "profile.userName")
      .skip((page - 1) * limit)
      .limit(limit);

    if (exactMatches.length > 0 || totalExactMatches > 0) {
      // Add _fuzzyMatch to exact matches with distance 0
      const exactMatchesWithFuzzy = exactMatches.map((book) => {
        // Determine which field matched for better frontend display
        let matchField = "";
        if (query) {
          // Check if it matched title or author
          const titleMatch = book.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const authorMatch = book.author
            .toLowerCase()
            .includes(query.toLowerCase());
          matchField = titleMatch ? "title" : authorMatch ? "author" : "query";
        } else {
          matchField = title ? "title" : author ? "author" : "publishYear";
        }

        return {
          ...book,
          _fuzzyMatch: {
            distance: 0,
            field: matchField,
          },
        };
      });

      return res.status(200).json({
        books: exactMatchesWithFuzzy,
        pagination: {
          totalBooks: totalExactMatches,
          totalPages: Math.ceil(totalExactMatches / limit),
          currentPage: page,
          hasNextPage: page < Math.ceil(totalExactMatches / limit),
          hasPrevPage: page > 1,
        },
      });
    }

    // STEP 2: If no exact matches, get all available non-donation books and try flexible filtering
    const allBooks = await Book.find(baseQuery)
      .lean()
      .populate("category")
      .populate("addedBy", "profile.userName");

    const filteredBooks = filterBooksWithFlexibleMatch(
      allBooks,
      query,
      title,
      author,
      publishYear
    );

    if (filteredBooks.length > 0) {
      // Calculate total and paginate results
      const totalFilteredBooks = filteredBooks.length;
      const paginatedFilteredBooks = filteredBooks.slice(
        (page - 1) * limit,
        page * limit
      );

      // Add _fuzzyMatch to filtered books with distance 1
      const filteredBooksWithFuzzy = paginatedFilteredBooks.map((book) => {
        // Determine which field matched
        let matchField = "";
        if (query) {
          const titleMatch =
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.title
              .toLowerCase()
              .split(/\s+/)
              .some(
                (word) =>
                  word.startsWith(query.toLowerCase()) ||
                  query.toLowerCase().startsWith(word)
              );

          const authorMatch =
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.author
              .toLowerCase()
              .split(/\s+/)
              .some(
                (word) =>
                  word.startsWith(query.toLowerCase()) ||
                  query.toLowerCase().startsWith(word)
              );

          matchField = titleMatch
            ? "title"
            : authorMatch
            ? "author"
            : "flexible";
        } else {
          matchField = title ? "title" : author ? "author" : "publishYear";
        }

        return {
          ...book,
          _fuzzyMatch: {
            distance: 1,
            field: matchField,
          },
        };
      });

      return res.status(200).json({
        books: filteredBooksWithFuzzy,
        pagination: {
          totalBooks: totalFilteredBooks,
          totalPages: Math.ceil(totalFilteredBooks / limit),
          currentPage: page,
          hasNextPage: page < Math.ceil(totalFilteredBooks / limit),
          hasPrevPage: page > 1,
        },
      });
    }

    // STEP 3: If still no matches, try fuzzy search with Levenshtein distance
    const fuzzySearchNeeded = query || title || author;
    if (!fuzzySearchNeeded) {
      return res.status(200).json({
        books: [],
        pagination: {
          totalBooks: 0,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    const fuzzyResults = performFuzzySearch(
      allBooks,
      query,
      title,
      author,
      publishYear,
      maxDistance
    );

    // Calculate total and paginate results
    const totalFuzzyResults = fuzzyResults.length;
    const paginatedFuzzyResults = fuzzyResults.slice(
      (page - 1) * limit,
      page * limit
    );

    // This is where _fuzzyMatch is added to each book object
    const fuzzyBooks = paginatedFuzzyResults.map((result) => ({
      ...result.book,
      _fuzzyMatch: {
        distance: result.distance,
        field: result.field,
      },
    }));

    return res.status(200).json({
      books: fuzzyBooks,
      pagination: {
        totalBooks: totalFuzzyResults,
        totalPages: Math.ceil(totalFuzzyResults / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalFuzzyResults / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({
      message: "Error searching books.",
      pagination: {
        totalBooks: 0,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }
};

// Helper function to build MongoDB query
function buildMongoQuery(query, title, author, publishYear) {
  const mongoQuery = {};

  if (query) {
    // Search both title and author with single query parameter
    mongoQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { author: { $regex: query, $options: "i" } },
    ];

    // If the query looks like a year, also search in publishYear
    if (/^\d{4}$/.test(query)) {
      mongoQuery.$or.push({ publishYear: query });
    }
  } else {
    const conditions = [];

    if (title) {
      conditions.push({ title: { $regex: title, $options: "i" } });
    }

    if (author) {
      conditions.push({ author: { $regex: author, $options: "i" } });
    }

    if (publishYear) {
      // Handle publishYear as string to match the stored format
      conditions.push({ publishYear: publishYear.toString() });
    }

    if (conditions.length > 0) {
      mongoQuery.$and = conditions;
    }
  }

  return mongoQuery;
}

// Helper function for flexible filtering
function filterBooksWithFlexibleMatch(
  books,
  query,
  title,
  author,
  publishYear
) {
  return books.filter((book) => {
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
      // Convert both to numbers for proper comparison
      const bookYear = parseInt(book.publishYear, 10);
      const searchYear = parseInt(publishYear, 10);
      yearMatch = bookYear === searchYear;
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
            (word) => word.startsWith(queryLower) || queryLower.startsWith(word)
          );

      const authorQueryMatch =
        authorLower.includes(queryLower) ||
        authorLower
          .split(/\s+/)
          .some(
            (word) => word.startsWith(queryLower) || queryLower.startsWith(word)
          );

      queryMatch = titleQueryMatch || authorQueryMatch;
    }

    return titleMatch && authorMatch && queryMatch && yearMatch;
  });
}

// Helper function for fuzzy search
function performFuzzySearch(
  books,
  query,
  title,
  author,
  publishYear,
  maxDistance
) {
  return books
    .map((book) => {
      let minDistance = Infinity;
      let matchField = "";

      if (query) {
        const queryLower = query.toLowerCase();
        const titleWords = book.title.toLowerCase().split(/\s+/);
        const authorWords = book.author.toLowerCase().split(/\s+/);

        const titleDistance = Math.min(
          ...titleWords.map((word) => levenshtein.get(word, queryLower))
        );

        const authorDistance = Math.min(
          ...authorWords.map((word) => levenshtein.get(word, queryLower))
        );

        const queryMinDistance = Math.min(titleDistance, authorDistance);

        if (queryMinDistance < minDistance) {
          minDistance = queryMinDistance;
          matchField = titleDistance <= authorDistance ? "title" : "author";
        }
      }

      if (title) {
        const titleLower = title.toLowerCase();
        const titleWords = book.title.toLowerCase().split(/\s+/);

        const titleDistance = Math.min(
          ...titleWords.map((word) => levenshtein.get(word, titleLower))
        );

        if (titleDistance < minDistance) {
          minDistance = titleDistance;
          matchField = "title";
        }
      }

      if (author) {
        const authorLower = author.toLowerCase();
        const authorWords = book.author.toLowerCase().split(/\s+/);

        const authorDistance = Math.min(
          ...authorWords.map((word) => levenshtein.get(word, authorLower))
        );

        if (authorDistance < minDistance) {
          minDistance = authorDistance;
          matchField = "author";
        }
      }

      if (publishYear) {
        // If publishYear doesn't match, exclude from results
        const bookYear = parseInt(book.publishYear, 10);
        const searchYear = parseInt(publishYear, 10);

        if (bookYear !== searchYear) {
          return { book, distance: Infinity, field: "" };
        }
      }

      return {
        book,
        distance: minDistance,
        field: matchField,
      };
    })
    .filter((result) => result.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

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

const getAllBooksForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (
      status &&
      ["available", "sold", "donated", "pending"].includes(status)
    ) {
      query.status = status;
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName profile.email")
      .lean();

    const totalBooks = await Book.countDocuments(query);

    return res.status(200).json({
      books,
      pagination: {
        totalBooks,
        totalPages: Math.ceil(totalBooks / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error("Error fetching books for admin:", error);
    return res.status(500).json({
      message: "Error fetching books",
      error: error.message,
    });
  }
};

const getAuthors = async (req, res) => {
  try {
    const authors = await Book.distinct("author").sort({ author: 1 });

    return res.status(200).json({
      success: true,
      count: authors.length,
      authors,
    });
  } catch (error) {
    console.error("Error fetching unique authors:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching unique authors",
      error: error.message,
    });
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
  getAllBooksForAdmin,
  getAuthors,
};
