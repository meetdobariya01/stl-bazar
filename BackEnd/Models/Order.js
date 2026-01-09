const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  guestId: { type: String, required: true }, // For guest users
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For registered users (optional)
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
  },
  paymentMethod: { type: String, default: "COD" }, // e.g., COD, UPI, Card
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, default: "Pending" }, // Pending, Confirmed, Shipped, Delivered
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
