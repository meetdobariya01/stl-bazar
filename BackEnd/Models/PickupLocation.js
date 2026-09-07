// Models/PickupLocation.js
const mongoose = require('mongoose');

const pickupLocationSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    unique: true
  },
  shiprocketPickupId: {
    type: String,
    default: null
  },
  nickname: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'India'
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookup
pickupLocationSchema.index({ vendorId: 1 });
pickupLocationSchema.index({ nickname: 1 });

module.exports = mongoose.model('PickupLocation', pickupLocationSchema);