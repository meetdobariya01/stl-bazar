// Models/Order.js - UPDATED WITH COUPON FIELDS, STOCK SNAPSHOT & SHIPROCKET
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
      stockAtPurchase: { type: Number, default: 0 }, // ✅ Stock snapshot at time of purchase
      image: [String],
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      company: { type: String, default: "N/A" },
      weight: { type: Number, default: 0.5 }, // ✅ Added weight for Shiprocket
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
  
  // Coupon fields
  coupon: {
    code: { type: String, default: null },
    discountType: { type: String, enum: ["percentage", "fixed"], default: null },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  },
  subtotal: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending" 
  },
  
  // ✅ SHIPROCKET SHIPMENTS
  shipments: [
    {
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      company: String,
      shipmentId: String,
      orderId: String,
      awbCode: String,
      labelUrl: String,
      status: {
        type: String,
        enum: ['created', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled'],
        default: 'created'
      },
      trackingUrl: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  
  // ✅ SHIPROCKET SYNC STATUS - FIXED ENUM
  shiprocketSyncStatus: {
    type: String,
    enum: ['pending', 'synced', 'failed', 'partial', 'skipped', 'disabled'],
    default: 'pending'
  },
  
  // ✅ SHIPROCKET ERROR (if any)
  shiprocketError: { type: String, default: null },

}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);