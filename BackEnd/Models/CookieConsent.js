// Models/CookieConsent.js
const mongoose = require("mongoose");

const CookieConsentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null if the user is a guest
    },
    email: {
      type: String,
      default: "Guest",
    },
    consentStatus: {
      type: String,
      enum: ["accepted", "declined"], // Only allows these two values
      required: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CookieConsent", CookieConsentSchema);
