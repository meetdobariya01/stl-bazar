const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Address = require("../models/Address");

// ================= SAVE ADDRESS =================
router.post("/", async (req, res) => {
  try {
    const { guestId, name, address } = req.body;

    // console.log("📦 Saving address:", { guestId, name, address });

    if (!guestId) {
      return res.status(400).json({ 
        success: false, 
        message: "Guest ID is required" 
      });
    }

    if (!address || !address.address || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill all address fields" 
      });
    }

    // ✅ Check if address already exists for this guestId
    let existingAddress = await Address.findOne({ guestId });

    if (existingAddress) {
      // Update existing address
      existingAddress.name = name || address.name;
      existingAddress.address = address;
      await existingAddress.save();
      
      // // console.log("✅ Address updated for guestId:", guestId);
      
      return res.json({
        success: true,
        message: "Address updated successfully",
        address: existingAddress,
      });
    }

    // ✅ Create new address
    const newAddress = new Address({
      guestId,
      name: name || address.name || "My Address",
      address: {
        name: address.name || name || "My Address",
        email: address.email || "",
        phone: address.phone || "",
        address: address.address || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "India"
      },
      isDefault: true,
    });

    await newAddress.save();
    
    // console.log("✅ New address saved for guestId:", guestId);
    
    return res.json({
      success: true,
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (err) {
    console.error("❌ Save address error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ================= GET ADDRESSES =================
router.get("/:guestId", async (req, res) => {
  try {
    const { guestId } = req.params;

    // console.log("📦 Fetching address for guestId:", guestId);

    if (!guestId) {
      return res.status(400).json({ 
        success: false, 
        message: "Guest ID is required" 
      });
    }

    const address = await Address.findOne({ guestId });

    // console.log("📦 Found address:", address ? "Yes" : "No");

    res.json({
      success: true,
      addresses: address ? [address] : [],
    });
  } catch (err) {
    console.error("❌ Get address error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

// ================= DELETE ADDRESS =================
router.delete("/:guestId/:addressId", async (req, res) => {
  try {
    const { guestId, addressId } = req.params;

    // console.log("📦 Deleting address:", { guestId, addressId });

    const address = await Address.findOne({ 
      _id: addressId, 
      guestId: guestId 
    });

    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: "Address not found" 
      });
    }

    await Address.findByIdAndDelete(addressId);

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete address error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

module.exports = router;