const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true 
    },
    subject: { 
      type: String, 
      required: true,
      trim: true 
    },
    message: { 
      type: String, 
      required: true,
      trim: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null
    },
    isClosed: { 
      type: Boolean, 
      default: false 
    },
    closedAt: {
      type: Date,
      default: null
    },
    responseMessage: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);