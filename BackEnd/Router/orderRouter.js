const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");

// Place an order
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({ message: "Incomplete data" });
  }

  try {
    // Fetch cart items
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      guestId,
      items: cart.items,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalPrice,
    });

    await order.save();

    // Clear cart after placing order
    await Cart.findOneAndDelete({ guestId });

    res.json({ message: "Order placed successfully", orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders by guestId
router.get("/:guestId", async (req, res) => {
  try {
    const orders = await Order.find({ guestId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
