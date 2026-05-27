const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Address Schema - Modified to use guestId instead of userId
const addressSchema = new mongoose.Schema({
  guestId: { type: String, required: true, index: true }, // Changed from userId to guestId
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

// Save address - Using guestId
router.post("/", async (req, res) => {
  try {
    const { guestId, address, name } = req.body;
    
    if (!guestId) {
      return res.status(400).json({ success: false, message: "Guest ID is required" });
    }
    
    // Check if address already exists for this guest
    const existingAddress = await Address.findOne({
      guestId,
      "address.address": address.address,
      "address.city": address.city,
      "address.pincode": address.pincode
    });
    
    if (existingAddress) {
      // Update existing address instead of creating duplicate
      existingAddress.name = name || "My Address";
      existingAddress.address = address;
      await existingAddress.save();
      return res.json({ success: true, address: existingAddress, message: "Address updated successfully" });
    }
    
    const newAddress = new Address({
      guestId,
      name: name || "My Address",
      address
    });
    
    await newAddress.save();
    res.json({ success: true, address: newAddress, message: "Address saved successfully" });
  } catch (err) {
    console.error("Save address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get guest's addresses
router.get("/:guestId", async (req, res) => {
  try {
    const addresses = await Address.find({ guestId: req.params.guestId }).sort({ createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    console.error("Fetch addresses error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete address
router.delete("/:guestId/:addressId", async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.addressId, 
      guestId: req.params.guestId 
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    
    await Address.findByIdAndDelete(req.params.addressId);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update default address
router.put("/:addressId/default", async (req, res) => {
  try {
    const { guestId } = req.body;
    // Remove default from all guest addresses
    await Address.updateMany({ guestId }, { isDefault: false });
    // Set new default
    await Address.findByIdAndUpdate(req.params.addressId, { isDefault: true });
    res.json({ success: true, message: "Default address updated" });
  } catch (err) {
    console.error("Update default address error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;