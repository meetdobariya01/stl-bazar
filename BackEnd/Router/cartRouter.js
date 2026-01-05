const express = require("express");
const Cart = require("../Models/Cart");

const router = express.Router();

/* GET CART */
router.get("/:guestId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ guestId: req.params.guestId });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ADD TO CART */
router.post("/add", async (req, res) => {
  const { guestId, product } = req.body;

  try {
    let cart = await Cart.findOne({ guestId });

    if (!cart) {
      cart = new Cart({ guestId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === product.productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push(product);
    }

    await cart.save();
    res.json(cart);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* REMOVE ITEM */
router.delete("/remove/:guestId/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ guestId: req.params.guestId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.productId.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* CLEAR CART */
router.delete("/clear/:guestId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ guestId: req.params.guestId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

