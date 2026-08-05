// Models/Order.js - UPDATED WITH COUPON FIELDS
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  guestId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: [String],
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      company: { type: String, default: "N/A" },
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
  paymentMethod: { type: String, default: "COD" },
  
  // ✅ ADD COUPON FIELDS HERE
  coupon: {
    code: { type: String, default: null },
    discountType: { type: String, enum: ["percentage", "fixed"], default: null },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  },
  subtotal: { type: Number, default: 0 }, // ✅ Original price before discount
  
  totalPrice: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending" 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);