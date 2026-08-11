const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  organizationName: {
    type: String,
    required: [true, "Organization name is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: [
      "Handmade Products",
      "Art & Craft",
      "Food & Gourmet",
      "Home Décor",
      "Sustainable Products",
      "Gifts & Hampers",
      "Community-Made Products",
      "Other",
    ],
  },
  causeDescription: {
    type: String,
    required: [true, "Cause/Mission description is required"],
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ngo", ngoSchema);
