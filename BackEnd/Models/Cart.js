// Models/Cart.js - UPDATED WITH VENDOR AND STOCK FIELDS
const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    guestId: {
      type: String,
      required: true,
      index: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product"
        },
        name: String,
        price: Number,
        originalPrice: Number,
        discountAmount: {
          type: Number,
          default: 0
        },
        couponCode: String,
        quantity: {
          type: Number,
          default: 1
        },
        image: [String],
        
        // ✅ ADD THESE FIELDS
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor"
        },
        company: {
          type: String,
          default: "N/A"
        },
        stock: {
          type: Number,
          default: 0
        }
      }
    ],

    appliedCoupon: {
      code: String,
      discountType: String,
      discountValue: Number,
      discountAmount: Number
    }
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);