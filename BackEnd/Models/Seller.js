// Models/Seller.js - WITHOUT next() FUNCTION
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
<<<<<<< HEAD
    // ✅ This will automatically convert array to string
=======
>>>>>>> b07a079438e99d2e346233fc43159f8b20919e2e
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
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
<<<<<<< HEAD
SellerSchema.pre('save', function(next) {
  // If category is an array, convert to string
  if (Array.isArray(this.category)) {
    this.category = this.category.join(', ');
  }
  this.updatedAt = new Date();
  next();
});
// Generate tracking ID if not exists
=======

// ✅ Using async/await - NO next() function
>>>>>>> b07a079438e99d2e346233fc43159f8b20919e2e
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
});

module.exports = mongoose.model('Seller', SellerSchema);
