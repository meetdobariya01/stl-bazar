// models/Product.js (user backend)

const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: { type: String, default: "" },
  size: { type: String, default: "" },
  image: { type: String, default: "" },
  stock: { type: Number, default: 0, min: 0 },
  isAvailable: { type: Boolean, default: true },
  price: { type: Number, default: 0 }
}, { _id: true });

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, required: true },
    categoryIcon: { type: String, default: "FaBoxOpen" },

    // Sub-category
    subcategory: { type: String, default: "" },
    subcategories: { type: [String], default: [] },

    // 🆕 VARIANTS
    variants: { type: [variantSchema], default: [] },

    image: [{ type: String }],
    size: { type: String },
    company: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    stock: { type: Number, default: 0, min: 0 },
    ratings: [{
      userName: { type: String, default: "Anonymous" },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);