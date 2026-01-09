const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: { type: String, required: true },
     categoryIcon: { type: String, default: "FaBoxOpen" },
    image: String,
    size: { type: String, required: true },
    company: { type: String, required: true },

    ratings: [
      {
        userName: { type: String, default: "Anonymous" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],

    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
