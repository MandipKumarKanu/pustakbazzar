const Contact = require("../models/Contact");
const { sendEmail } = require("./authController");

const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = req.user ? req.user._id : null;

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
      userId,
    });

    await newContact.save();

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Message Received</h2>
        <p>Hello ${name},</p>
        <p>Thank you for contacting PustakBazzar. We have received your message:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
          <h4>${subject}</h4>
          <p>${message}</p>
        </div>
        <p>Our team will get back to you within 24-48 hours.</p>
        <p>Best regards,<br>PustakBazzar Support Team</p>
      </div>
    `;

    await sendEmail(email, "Message Received - PustakBazzar", confirmationHtml);

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
      
      // Send reply email to the user
      const replyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #531d99, #8b30ff); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
              <h1 style="margin: 0; font-size: 24px;">PustakBazzar Support</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for contacting us</p>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #531d99; margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Your Original Message:</h3>
            <p style="margin: 0; color: #666;"><strong>Subject:</strong> ${contact.subject}</p>
            <p style="margin: 10px 0 0 0; color: #666;">${contact.message}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">Our Response:</h3>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 6px; line-height: 1.6;">
              ${responseMessage.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="background-color: #f0ebff; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #8b30ff;">
            <h4 style="color: #531d99; margin: 0 0 10px 0;">Need Further Assistance?</h4>
            <p style="margin: 0; color: #531d99;">If you have any additional questions or concerns, please don't hesitate to contact us again. We're here to help!</p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; margin: 10px 0;">Best regards,</p>
            <p style="color: #531d99; font-weight: bold; margin: 5px 0;">PustakBazzar Support Team</p>
            <p style="color: #999; font-size: 12px; margin: 15px 0 0 0;">
              This message was sent in response to your inquiry on ${new Date(contact.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      `;

      await sendEmail(
        contact.email, 
        `Re: ${contact.subject} - PustakBazzar Support`, 
        replyHtml
      );
    }

    await contact.save();

    res.status(200).json({
      message: responseMessage 
        ? "Contact closed and reply sent successfully" 
        : "Contact marked as closed",
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
