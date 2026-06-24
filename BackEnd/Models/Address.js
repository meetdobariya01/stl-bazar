const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  // ✅ Use guestId instead of userId
  guestId: { 
    type: String, 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  address: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { 
      type: String, 
      default: "India" 
    }
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Address", addressSchema);