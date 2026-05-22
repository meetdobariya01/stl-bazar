const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
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
  businessName: {
    type: String,
    required: [true, "Business name is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: ["Fashion", "Handmade", "Beauty", "Home Decor", "Electronics", "Food", "Jewelry", "Other"],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Seller", sellerSchema);