const express = require("express");
const asyncHandler = require("../Middleware/asyncHandler");
const Product = require("../Models/Product");

const router = express.Router();

/* ======================================
   POST: Add Review (NO AUTH)
====================================== */
router.post(
  "/:productId/review",
  asyncHandler(async (req, res) => {
    const { rating, review, userName } = req.body;
    const { productId } = req.params;

    if (!rating || !review) {
      return res.status(400).json({ message: "Rating and review are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add review (anonymous or name-based)
    product.ratings.push({
      userName: userName || "Anonymous",
      rating,
      review,
    });

    // Calculate average rating
    product.averageRating =
      product.ratings.reduce((sum, r) => sum + r.rating, 0) /
      product.ratings.length;

    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      averageRating: product.averageRating,
      totalReviews: product.ratings.length,
    });
  })
);

/* ======================================
   GET: All Reviews for Product
====================================== */
router.get(
  "/:productId/reviews",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      averageRating: product.averageRating,
      totalReviews: product.ratings.length,
      reviews: product.ratings,
    });
  })
);

module.exports = router;
