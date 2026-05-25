const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String, default: "" },
  icon: { type: String, default: "FaBoxOpen" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);