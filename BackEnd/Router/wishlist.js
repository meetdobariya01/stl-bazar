const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");

// GET wishlist by guestId
router.get("/:guestId", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ guestId: req.params.guestId });
    if (!wishlist) return res.json({ items: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add item to wishlist
router.post("/add", async (req, res) => {
  try {
    const { guestId, product } = req.body;

    let wishlist = await Wishlist.findOne({ guestId });

    if (!wishlist) {
      wishlist = new Wishlist({ guestId, items: [] });
    }

    // Avoid duplicates
    const exists = wishlist.items.some(
      (item) => item.productId.toString() === product.productId
    );

    if (!exists) {
      wishlist.items.push(product);
    }

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove item from wishlist
router.delete("/remove", async (req, res) => {
  try {
    const { guestId, productId } = req.body;

    const wishlist = await Wishlist.findOne({ guestId });
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE clear entire wishlist
router.delete("/clear/:guestId", async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ guestId: req.params.guestId });
    res.json({ message: "Wishlist cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;