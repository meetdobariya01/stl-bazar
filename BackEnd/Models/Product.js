const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: String,
  image: [String],
  company: String,
  vendor: String,
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stock: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model already exists before creating
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;