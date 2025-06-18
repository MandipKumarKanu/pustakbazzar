const Book = require("../models/Book");
const User = require("../models/User");
const addCustomClassesToHtml = require("../utils/addCustomClass");
const Donation = require("../models/Donation");
const levenshtein = require("fast-levenshtein");
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Session = require("../models/Session");

// const fetch = require("node-fetch");
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
    isbn,
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
      bookLanguage: language,
      isbn,
    });

    const savedBook = await book.save();

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

    const platformFeePercentage = 0.1; // Flat 10%

    res.status(201).json({
      success: true,
      data: savedBook,
      feeInfo: {
        platformFeePercentage: platformFeePercentage,
        estimatedFee: savedBook.sellingPrice * platformFeePercentage,
        estimatedEarnings: savedBook.sellingPrice * (1 - platformFeePercentage),
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, minPrice, maxPrice } = req.query;
    console.log("called");
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

    const filteredBooks = books.filter((book) => book.addedBy !== null);

    const totalBooks = await Book.countDocuments(query);

    return res.status(200).json({
      books: filteredBooks,
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
    isbn,
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
        isbn,
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
          const isbnMatch = book.isbn
            ? book.isbn.toLowerCase().includes(query.toLowerCase())
            : false;
          matchField = titleMatch
            ? "title"
            : authorMatch
            ? "author"
            : isbnMatch
            ? "isbn"
            : "query";
        } else {
          matchField = title
            ? "title"
            : author
            ? "author"
            : publishYear
            ? "publishYear"
            : "isbn";
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

          const isbnMatch = book.isbn
            ? book.isbn.toLowerCase().includes(query.toLowerCase())
            : false;

          matchField = titleMatch
            ? "title"
            : authorMatch
            ? "author"
            : isbnMatch
            ? "isbn"
            : "flexible";
        } else {
          matchField = title
            ? "title"
            : author
            ? "author"
            : publishYear
            ? "publishYear"
            : "isbn";
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
          currentPage: 1,
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
    // Search both title, author and ISBN with single query parameter
    mongoQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { author: { $regex: query, $options: "i" } },
      { isbn: { $regex: query, $options: "i" } },
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
    let isbnMatch = true;

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
      const isbn = book.isbn || "";

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

      const isbnQueryMatch = isbn.includes(queryLower);

      queryMatch = titleQueryMatch || authorQueryMatch || isbnQueryMatch;
    }

    return titleMatch && authorMatch && queryMatch && yearMatch && isbnMatch;
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
        const isbn = book.isbn || "";

        const titleDistance = Math.min(
          ...titleWords.map((word) => levenshtein.get(word, queryLower))
        );

        const authorDistance = Math.min(
          ...authorWords.map((word) => levenshtein.get(word, queryLower))
        );

        // Exact ISBN match gets distance 0, otherwise calculate Levenshtein
        const isbnDistance =
          isbn.toLowerCase() === queryLower
            ? 0
            : levenshtein.get(isbn.toLowerCase(), queryLower);

        const queryMinDistance = Math.min(
          titleDistance,
          authorDistance,
          isbnDistance
        );

        if (queryMinDistance < minDistance) {
          minDistance = queryMinDistance;
          matchField =
            titleDistance <= authorDistance && titleDistance <= isbnDistance
              ? "title"
              : authorDistance <= isbnDistance
              ? "author"
              : "isbn";
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

const generateBookDescription = async (req, res) => {
  try {
    const { title, author, condition } = req.body;

    if (!title || !author || !condition) {
      return res.status(400).json({
        message:
          "Title, author, and condition are required to generate a description.",
      });
    }

    const prompt = `
Generate a detailed and accurate description for a second-hand book titled "<strong>${title}</strong>" authored by <em>${author}</em>. 

The description should:

- Be specific to the book's content, themes, and key features.
- Use HTML formatting suitable for a WYSIWYG editor (e.g., ckEditor):
  - Use <strong> for bold text, <em> for italic text, and <p> for paragraphs.
  - Include bullet points or lists where appropriate.
- Highlight the book's storyline, themes, and unique aspects.
- Avoid generic phrases, filler text, or unrelated information.
- Emphasize its value as a second-hand book, including its condition (<strong>${condition}</strong>).
- Keep the description concise and under 200 words.

If you are unsure, say I'm unsure about the description please recheck in very first line highlighted, bold and italicized.
Return only the formatted description, without any additional commentary or placeholders.
`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const description = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!description) {
      throw new Error("Failed to generate description.");
    }

    res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating book description.",
      error: error.message,
    });
  }
};

const generateReviewSummary = async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Both title and author are required to generate a summary.",
      });
    }

    const prompt = `
You are an expert book reviewer. Summarize the book titled "<strong>${title}</strong>" authored by <em>${author}</em>.

Format the summary using clean, semantic HTML that is compatible with CKEditor. Structure it into the following sections:

<br><br><strong>Key Points:</strong>
<ul>
  <li>List compelling strengths of the book (e.g., engaging storyline, valuable insights, clear writing)</li>
</ul>

<br><strong>Overall Verdict:</strong>
<p>Write a concise, balanced conclusion about the book’s overall value, appeal, and who it is best suited for.</p>

Guidelines:
- Keep the full summary under 150 words.
- Use proper paragraph spacing and indentation.
- Avoid any content outside the requested format — no introductions, disclaimers, or unrelated remarks.
- Do not add your own opinions — only summarize based on general book reviews.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new Error("Failed to generate review summary.");
    }

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating review summary.",
      error: error.message,
    });
  }
};

const aiBookSearch = async (req, res) => {
  try {
    const { sId, query } = req.body;
    const startTime = Date.now();

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Valid search query is required.",
      });
    }

    if (!sId || typeof sId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid session ID.",
      });
    }

    let session = await Session.findOne({ sessionId: sId });

    if (!session) {
      session = await Session.create({
        sessionId: sId,
        lastActive: new Date(),
        conversations: [],
      });
    }

    let historyText = "";
    if (Array.isArray(session.conversations)) {
      const recent = session.conversations.slice(-3);
      historyText = recent
        .map((c) => `User: ${c.user}\nAssistant: ${c.ai}`)
        .join("\n");
      if (historyText) historyText += "\n";
    }

    const category = await Category.distinct("categoryName");

    console.log(category);

    const prompt = `You are PustakBazzar's AI assistant(PustakAI). You respond naturally to any user input—greetings, platform questions, or book‐search requests—and you also extract structured search filters when appropriate.

Respond with a single JSON object like this:
{
  "reply": "<your friendly, helpful assistant reply>",
  "filters": {
    "category": [<strings>] or null,
    "minPrice": <number> or null,
    "maxPrice": <number> or null,
    "sortBy": "price_asc" | "price_desc" | "rating" | "newest" or null,
    "condition": "<good|excellent|fair>" or null,
    "keyword": "<author or title text>" or null,
    "isbn": "<ISBN number>" or null,
    "language": "<English|Hindi|…>" or null
  }
}

Guidelines:
– Craft "reply" as if you're a real personal assistant on PustakBazzar, even when no search is performed.
– Keep responses concise and polite
– If the user is not asking to search for books, set **all** fields in "filters" to null.  
– Direct search terms (like "naruto") should set keyword filter without asking questions
– For mood-based queries, suggest relevant book categories
– Only mention payment options (Khalti/Stripe), seller approval process, or team information when directly asked
– Payment option is khalti for nepali payment or stripe for international payment.
– User to become seller need to fill a form and get approved by admin you can find it in profile section.
– Made by: mandip shah(frontend, backend) and aadarsh kushuwaha(backend) (UI inspired from kitabkunj made during ideathon where we as a team F5)  
– (siddhartha singh  and mandip made UI there) (mention both when talk about UI)
– Made in Nepal as of nepal
– Project was supervised by Mr. Anish Ansari sir.
– Don't mention anything without asking about payment or something.
– Just reply what user is asking for, dont add extra things.
– Don't output any extra text—just valid JSON.
– My categories in the platform are: ${category.join(", ")}.
  
${historyText}
User: ${query}`;
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(
        `API error (${geminiResponse.status}): ${await geminiResponse.text()}`
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty response from AI service");

    const cleanText = rawText
      .replace(
        /```(?:json)?([\s\S]*?)```|^([\s\S]*)$/g,
        (_, p1, p2) => p1 || p2
      )
      .trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch (err) {
      console.error("JSON parsing error:", err, "\nRaw text:", rawText);
      throw new Error("Failed to parse AI response.");
    }

    const { reply, filters } = parsedResponse;

    await Session.findOneAndUpdate(
      { sessionId: sId },
      {
        $set: { lastActive: new Date() },
        $push: {
          conversations: {
            user: query,
            ai: reply,
            filters,
          },
        },
      },
      { upsert: true }
    );

    const queryObj = await buildQueryFromFilters(filters);
    if (!queryObj) {
      return res.status(200).json({
        success: true,
        results: {
          count: 0,
          books: [],
          message: reply,
        },
        analytics: {
          query,
          extractedFilters: filters,
          processingTime: `${Date.now() - startTime}ms`,
        },
      });
    }

    const books = await Book.find(queryObj)
      .sort(getSortOption(filters.sortBy))
      .limit(10)
      .select(
        "title author sellingPrice images condition publishYear edition bookLanguage forDonation"
      )
      .populate("category", "categoryName")
      .populate("addedBy", "profile.userName")
      .lean();

    return res.status(200).json({
      success: true,
      results: {
        count: books.length,
        books,
        message:
          books.length > 0
            ? reply
            : `${reply} I couldn't find any matching books.`,
      },
      analytics: {
        query,
        extractedFilters: filters,
        processingTime: `${Date.now() - startTime}ms`,
      },
    });
  } catch (err) {
    console.error("AI search error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to process your search request.",
      details: err.message,
    });
  }
};

async function buildQueryFromFilters(filters) {
  if (
    !filters ||
    Object.values(filters).every(
      (v) => v === null || (Array.isArray(v) && v.length === 0)
    )
  ) {
    return null;
  }

  const query = { status: "available", forDonation: false };

  if (filters.category) {
    const categories = Array.isArray(filters.category)
      ? filters.category
      : [filters.category];

    if (categories.length > 0) {
      const categoryDocs = await Category.find({
        categoryName: { $in: categories.map((c) => new RegExp(c, "i")) },
      });

      if (categoryDocs.length > 0) {
        query.category = { $in: categoryDocs.map((doc) => doc._id) };
        console.log(
          `Found categories: ${categoryDocs
            .map((c) => c.categoryName)
            .join(", ")}`
        );
      } else if (
        categoryDocs.length === 0 &&
        filters.minPrice == null &&
        filters.maxPrice == null &&
        filters.condition == null &&
        filters.language == null &&
        filters.keyword == null &&
        filters.isbn == null
      ) {
        return null;
      } else {
        console.log(
          `No matching categories found for: ${categories.join(", ")}`
        );
      }
    }
  }

  if (filters.minPrice || filters.maxPrice) {
    query.sellingPrice = {};
    if (filters.minPrice !== null)
      query.sellingPrice.$gte = Number(filters.minPrice);
    if (filters.maxPrice !== null)
      query.sellingPrice.$lte = Number(filters.maxPrice);
  }

  if (filters.condition) query.condition = filters.condition;
  if (filters.language) query.bookLanguage = new RegExp(filters.language, "i");

  if (filters.keyword) {
    query.$or = [
      { title: { $regex: filters.keyword, $options: "i" } },
      { author: { $regex: filters.keyword, $options: "i" } },
    ];
  }

  if (filters.isbn) {
    if (!query.$or) query.$or = [];
    query.$or.push({ isbn: { $regex: filters.isbn, $options: "i" } });
  }

  return query;
}

function getSortOption(sortBy) {
  const sortOptions = {
    price_asc: { sellingPrice: 1 },
    price_desc: { sellingPrice: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };
  return sortOptions[sortBy] || { createdAt: -1 };
}

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
  generateBookDescription,
  generateReviewSummary,
  aiBookSearch,
};
