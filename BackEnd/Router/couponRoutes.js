const express = require("express");
const router = express.Router();
const Coupon = require("../Models/Coupon");
const Cart = require("../Models/Cart");

// ========== VALIDATE COUPON ==========
router.post("/validate", async (req, res) => {
  const { code, guestId, subtotal, items } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Coupon code is required" });
  }

  try {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

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
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
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

// ========== APPLY COUPON (Store in cart/session) ==========
router.post("/apply", async (req, res) => {
  const { code, guestId, subtotal } = req.body;

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
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
            discountAmount: coupon.discountType === "percentage" 
              ? (subtotal * coupon.discountValue) / 100 
              : coupon.discountValue
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
router.delete("/remove/:guestId", async (req, res) => {
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

module.exports = router;