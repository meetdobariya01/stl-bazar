// Models/Seller.js - WITH OTP SUPPORT (No next() function)

const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
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
    set: function(value) {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value;
    }
  },
  website: {
    type: String,
    default: '',
  },
  pricingPlan: {
    type: String,
    enum: ['STARTER', 'GROWTH', 'PREMIUM', ''],
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
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
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  // ============================================================
  // ✅ OTP VERIFICATION FIELDS
  // ============================================================
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  otpCode: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  otpLastRequested: {
    type: Date,
    select: false,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ============================================================
// ✅ PRE-SAVE MIDDLEWARE - WITHOUT next() (Using async/await)
// ============================================================
SellerSchema.pre('save', async function() {
  // Convert category if it's an array
  if (Array.isArray(this.category)) {
    this.category = this.category.join(', ');
  }
  
  // Generate tracking ID if not exists
  if (!this.trackingId) {
    const random = Math.floor(10000 + Math.random() * 90000);
    this.trackingId = `APP-${random}`;
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  
  // ✅ No need for next() - async function automatically handles it
});

// ============================================================
// ✅ OTP METHODS
// ============================================================

// Generate OTP code (6 digits)
SellerSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  this.otpCode = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpAttempts = 0;
  this.otpLastRequested = new Date();
  
  return otp;
};

// Verify OTP
SellerSchema.methods.verifyOTP = function(enteredOTP) {
  // Check if OTP exists
  if (!this.otpCode) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }
  
  // Check if OTP expired
  if (new Date() > this.otpExpires) {
    return { valid: false, message: "OTP has expired. Please request a new one." };
  }
  
  // Check attempts
  if (this.otpAttempts >= 5) {
    return { valid: false, message: "Too many failed attempts. Please request a new OTP." };
  }
  
  // Increment attempts
  this.otpAttempts += 1;
  
  // Verify OTP
  if (this.otpCode !== enteredOTP) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }
  
  // OTP is valid - mark phone as verified
  this.phoneVerified = true;
  this.otpCode = undefined;
  this.otpExpires = undefined;
  this.otpAttempts = 0;
  
  return { valid: true, message: "Phone number verified successfully!" };
};

// Check if OTP is expired
SellerSchema.methods.isOTPExpired = function() {
  return !this.otpExpires || new Date() > this.otpExpires;
};

// Get OTP status
SellerSchema.methods.getOTPStatus = function() {
  return {
    phoneVerified: this.phoneVerified,
    hasOTP: !!this.otpCode,
    isExpired: this.isOTPExpired(),
    attemptsUsed: this.otpAttempts || 0,
    attemptsRemaining: 5 - (this.otpAttempts || 0),
  };
};

// Clear OTP
SellerSchema.methods.clearOTP = function() {
  this.otpCode = undefined;
  this.otpExpires = undefined;
  this.otpAttempts = 0;
};

module.exports = mongoose.model('Seller', SellerSchema);