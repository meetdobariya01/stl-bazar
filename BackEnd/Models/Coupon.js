const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  // Vendor/Company information
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  company: {
    type: String,
    default: null
  },
  vendorName: {
    type: String,
    default: null
  },
  // Product-specific restrictions
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  // Flag to indicate if coupon is for specific products only
  isProductSpecific: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);