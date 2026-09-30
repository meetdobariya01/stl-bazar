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
      stockAtPurchase: { type: Number, default: 0 },
      image: [String],
      vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
      company: { type: String, default: "N/A" },
      weight: { type: Number, default: 0.5 },
      shippingCost: {
        type: Number,
        default: 0,
      },
      // VARIANT FIELDS
      variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
      selectedColor: { type: String, default: "" },
      selectedSize: { type: String, default: "" },
      variantImage: { type: String, default: "" },
      variantPrice: { type: Number, default: 0 },

      // CUSTOM FIELD
      customFieldLabel: { type: String, default: null },
      customFieldValue: { type: String, default: null },
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
codCharges: {
  type: Number,
  default: 0,
},
  // PAYMENT STATUS
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending",
  },

  // PAYU FIELDS
  payuTxnId: { type: String, default: null },
  payuPaymentId: { type: String, default: null },

  // SHIPROCKET CHECKOUT FIELDS
  shiprocketPaymentId: { type: String, default: null },
  shiprocketOrderId: { type: String, default: null },

  // 🆕 FASTrr CART ID — reliable webhook matching
  fastrrCartId: { type: String, default: null, index: true },

  coupon: {
    code: { type: String, default: null },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null,
    },
    discountValue: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  },
  subtotal: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },

  // 🆕 ORDER STATUS — PENDING_PAYMENT added for Fastrr checkout flow
  orderStatus: {
    type: String,
    enum: [
      "PENDING_PAYMENT",   // ✅ NEW — order created, payment pending
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ],
    default: "Pending",
  },

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
        enum: [
          "created",
          "pickup_scheduled",
          "in_transit",
          "delivered",
          "cancelled",
        ],
        default: "created",
      },
      trackingUrl: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  shiprocketSyncStatus: {
    type: String,
    enum: ["pending", "synced", "failed", "partial", "skipped", "disabled"],
    default: "pending",
  },

  shiprocketError: { type: String, default: null },

  // 🆕 STATUS TRACKING FIELDS
  statusUpdatedAt: {
    type: Date,
    default: null,
  },
  statusUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  statusHistory: [
    {
      status: String,
      updatedAt: { type: Date, default: Date.now },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      note: { type: String, default: "" },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);