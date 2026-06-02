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
          required: true
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1
        },
        image: [String]  // Changed to array
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