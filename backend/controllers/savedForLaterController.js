const User = require("../models/User");
const Book = require("../models/Book");

const saveForLater = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const user = await User.findById(req.user._id);
    if (user.savedForLater.includes(bookId)) {
      return res
        .status(400)
        .json({ message: "Book is already saved for later." });
    }

    user.savedForLater.push(bookId);
    await user.save();

    res.status(200).json({
      message: "Book saved for later.",
      savedBooks: user.savedForLater,
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving book for later." });
  }
};

const isSaved = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedForLater.includes(bookId);

    return res.status(200).json({ isSaved: isSaved });
  } catch (err) {
    res.status(500).json({ message: "Error saving book for later." });
  }
};

const getSavedForLater = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedForLater");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ savedBooks: user.savedForLater });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved books." });
  }
};

const removeFromSavedForLater = async (req, res) => {
  try {
    const { id: bookId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const bookIndex = user.savedForLater.indexOf(bookId);
    if (bookIndex === -1) {
      return res.status(400).json({ message: "Book not found in saved list." });
    }

    user.savedForLater.splice(bookIndex, 1);
    await user.save();

    res.status(200).json({
      message: "Book removed from saved for later.",
      savedBooks: user.savedForLater,
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing book from saved list." });
  }
};

module.exports = {
  saveForLater,
  getSavedForLater,
  removeFromSavedForLater,
  isSaved,
};
