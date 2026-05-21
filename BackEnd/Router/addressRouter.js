// addressRouter.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Address Schema
const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  address: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" }
  },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Address = mongoose.model("Address", addressSchema);

// Save address
router.post("/", async (req, res) => {
  try {
    const { userId, address, name } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    const newAddress = new Address({
      userId,
      name: name || "My Address",
      address
    });
    
    await newAddress.save();
    res.json({ success: true, address: newAddress });
  } catch (err) {
    console.error("Save address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user's addresses
router.get("/:userId", async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    console.error("Fetch addresses error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete address
router.delete("/:userId/:addressId", async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.addressId);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update default address
router.put("/:addressId/default", async (req, res) => {
  try {
    const { userId } = req.body;
    // Remove default from all user addresses
    await Address.updateMany({ userId }, { isDefault: false });
    // Set new default
    await Address.findByIdAndUpdate(req.params.addressId, { isDefault: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Update default address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;