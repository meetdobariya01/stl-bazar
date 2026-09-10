const mongoose = require("mongoose");

// 🆕 Sub-category sub-schema
const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { _id: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String, default: "" },
  icon: { type: String, default: "FaBoxOpen" },
  order: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  // 🆕 CRITICAL — Add this
  subcategories: {
    type: [subCategorySchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);