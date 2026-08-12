// Models/Seller.js - WITHOUT next() function

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
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  
  // ✅ TRACKING FIELDS
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
  
  // ✅ ADMIN REVIEW FIELDS
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
  
  // ✅ VENDOR ACCOUNT LINK
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

// ✅ FIX: Using async function without next()
SellerSchema.pre('save', async function() {
  // Generate tracking ID if not exists
  if (!this.trackingId) {
    const random = Math.floor(10000 + Math.random() * 90000);
    this.trackingId = `APP-${random}`;
  }
  // Update updatedAt timestamp
  this.updatedAt = new Date();
  // No next() needed - async function automatically continues
});

module.exports = mongoose.model('Seller', SellerSchema);