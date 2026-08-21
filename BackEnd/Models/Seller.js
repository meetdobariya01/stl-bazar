// Models/Seller.js - WITH website and pricingPlan fields

const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  
  // ✅ NEW FIELDS - Website/Social Media & Pricing Plan
  website: {
    type: String,
    default: '',
  },
  pricingPlan: {
    type: String,
    enum: ['STARTER', 'GROWTH', 'PREMIUM', ''],
    default: '',
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  
  // TRACKING FIELDS
  trackingId: {
    type: String,
    unique: true,
  },
  trackingToken: {
    type: String,
  },
  trackingTokenExpires: {
    type: Date,
  },
  
  // ADMIN REVIEW FIELDS
  reviewedBy: {
    type: String,
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  adminNotes: {
    type: String,
  },
  
  // VENDOR ACCOUNT LINK
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  
  // Timestamps
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate tracking ID if not exists
SellerSchema.pre('save', async function() {
  if (!this.trackingId) {
    const random = Math.floor(10000 + Math.random() * 90000);
    this.trackingId = `APP-${random}`;
  }
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Seller', SellerSchema);