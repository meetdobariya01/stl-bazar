// Models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    image: { 
      type: String, 
      default: "" 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);