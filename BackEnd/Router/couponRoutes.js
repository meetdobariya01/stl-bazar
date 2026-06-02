const express = require("express");
const router = express.Router();
const Coupon = require("../Models/Coupon");
const Cart = require("../Models/Cart");

// ========== GET AVAILABLE COUPONS ==========
router.post("/user/available", async (req, res) => {
  try {
    const { guestId, subtotal } = req.body;

    // console.log("Fetching available coupons for subtotal:", subtotal);

    // Fix: Use expiryDate instead of validUntil
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() } // Only future expiry dates
    }).sort({ createdAt: -1 });

    // console.log("Found coupons:", coupons.length);
    // console.log("Coupons:", coupons.map(c => ({ code: c.code, minOrderAmount: c.minOrderAmount })));

    // Filter valid coupons based on min order amount
    const validCoupons = coupons.filter((coupon) => {
      return subtotal >= (coupon.minOrderAmount || 0);
    });

    const formattedCoupons = validCoupons.map((coupon) => ({
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      vendorName: coupon.vendorName || null
    }));

    res.json({
      success: true,
      coupons: formattedCoupons
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ========== VALIDATE COUPON ==========
router.post("/user/validate", async (req, res) => {
  const { code, guestId, subtotal } = req.body;

  // console.log("Validating coupon:", { code, guestId, subtotal });

  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required" });
  }

  try {
    // Fix: Use expiryDate instead of validFrom/validUntil
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() } // Only show if not expired
    });

    console.log("Found coupon:", coupon);

    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid or expired coupon code" 
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        success: false, 
        message: "Coupon usage limit reached" 
      });
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required. Your subtotal is ₹${subtotal}` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        minOrderAmount: coupon.minOrderAmount,
        description: coupon.description
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== APPLY COUPON ==========
router.post("/user/apply", async (req, res) => {
  const { code, guestId, subtotal } = req.body;

  // console.log("Applying coupon:", { code, guestId, subtotal });

  if (!code || !guestId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    // Store applied coupon in cart
    await Cart.findOneAndUpdate(
      { guestId },
      { 
        $set: { 
          appliedCoupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: parseFloat(discountAmount.toFixed(2))
          }
        }
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== REMOVE COUPON ==========
router.delete("/user/remove/:guestId", async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { guestId: req.params.guestId },
      { $unset: { appliedCoupon: "" } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== ADMIN: CREATE COUPON ==========
router.post("/admin/create", async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.json({ success: true, coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== ADMIN: GET ALL COUPONS ==========
router.get("/admin/all", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== ADMIN: DELETE COUPON ==========
router.delete("/admin/:couponId", async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.couponId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Test route to verify the router is working
router.get("/test", (req, res) => {
  res.json({ message: "Coupon routes are working!" });
});

module.exports = router;