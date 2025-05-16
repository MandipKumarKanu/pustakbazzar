const Contact = require("../models/Contact");

// Create a new contact message
const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If user is logged in, add their userId
    const userId = req.user ? req.user._id : null;

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
      userId,
    });

    await newContact.save();

    res.status(201).json({
      message: "Message sent successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Mark a contact as closed
const closeContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { responseMessage } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    contact.isClosed = true;
    contact.closedAt = new Date();

    if (responseMessage) {
      contact.responseMessage = responseMessage;
    }

    await contact.save();

    res.status(200).json({
      message: "Contact marked as closed",
      contact,
    });
  } catch (error) {
    console.error("Error closing contact:", error);
    res.status(500).json({ message: "Error marking contact as closed" });
  }
};

// Get all contacts (with optional filters)
const getAllContacts = async (req, res) => {
  try {
    const { isClosed, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    // Add isClosed filter if provided
    if (isClosed !== undefined) {
      filter.isClosed = isClosed === "true";
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "profile.userName profile.email");

    // Get total count for pagination
    const totalContacts = await Contact.countDocuments(filter);

    res.status(200).json({
      contacts,
      pagination: {
        total: totalContacts,
        pages: Math.ceil(totalContacts / parseInt(limit)),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting contacts:", error);
    res.status(500).json({ message: "Error retrieving contacts" });
  }
};

// Get contact details by ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id).populate(
      "userId",
      "profile.userName profile.email"
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ contact });
  } catch (error) {
    console.error("Error getting contact:", error);
    res.status(500).json({ message: "Error retrieving contact details" });
  }
};

module.exports = {
  createContact,
  closeContact,
  getAllContacts,
  getContactById,
};
