// routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const Coupon = require("../Models/Coupon");
const Cart = require("../Models/Cart"); 
// ========== PUBLIC COUPON ENDPOINTS ==========

// Get coupons for a specific product
// Get coupons for a specific product - Updated
router.get("/public/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`Fetching coupons for product: ${productId}`);
    
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
      $or: [
        // Check both possible field names
        { productIds: { $in: [productId] } },
        { products: { $in: [productId] } },
        { productIds: { $exists: false } },
        { productIds: [] },
        { products: { $exists: false } },
        { products: [] }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${coupons.length} coupons for product`);
    
    res.json({
      success: true,
      coupons: coupons.map(c => ({
        _id: c._id,
        code: c.code,
        description: c.description || `${c.discountValue || c.discount || 0}% off`,
        discountType: c.discountType || c.type || 'percentage',
        discountValue: c.discountValue || c.discount || 0,
        minOrderAmount: c.minOrderAmount || 0,
        maxDiscount: c.maxDiscount || 0,
        company: c.company || c.vendorName || null,
        expiryDate: c.expiryDate,
        discount: c.discount || c.discountValue || 0,
        type: c.type || c.discountType || 'percentage',
        isActive: c.isActive
      }))
    });
  } catch (err) {
    console.error("Error fetching product coupons:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get coupons by company name - Updated
router.get("/public/company/:companyName", async (req, res) => {
  try {
    const { companyName } = req.params;
    
    console.log(`Fetching coupons for company: ${companyName}`);
    
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
      $or: [
        { company: { $regex: new RegExp(companyName, 'i') } },
        { vendorName: { $regex: new RegExp(companyName, 'i') } }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${coupons.length} coupons for company`);
    
    res.json({
      success: true,
      coupons: coupons.map(c => ({
        _id: c._id,
        code: c.code,
        description: c.description || `${c.discountValue || c.discount || 0}% off`,
        discountType: c.discountType || c.type || 'percentage',
        discountValue: c.discountValue || c.discount || 0,
        minOrderAmount: c.minOrderAmount || 0,
        maxDiscount: c.maxDiscount || 0,
        company: c.company || c.vendorName || null,
        expiryDate: c.expiryDate,
        discount: c.discount || c.discountValue || 0,
        type: c.type || c.discountType || 'percentage',
        isActive: c.isActive
      }))
    });
  } catch (err) {
    console.error("Error fetching company coupons:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get all available coupons - Updated
router.get("/public/all", async (req, res) => {
  try {
    console.log("Fetching all available coupons");
    
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    console.log(`Found ${coupons.length} total coupons`);
    
    res.json({
      success: true,
      coupons: coupons.map(c => ({
        _id: c._id,
        code: c.code,
        description: c.description || `${c.discountValue || c.discount || 0}% off`,
        discountType: c.discountType || c.type || 'percentage',
        discountValue: c.discountValue || c.discount || 0,
        minOrderAmount: c.minOrderAmount || 0,
        maxDiscount: c.maxDiscount || 0,
        company: c.company || c.vendorName || null,
        expiryDate: c.expiryDate,
        discount: c.discount || c.discountValue || 0,
        type: c.type || c.discountType || 'percentage',
        isActive: c.isActive
      }))
    });
  } catch (err) {
    console.error("Error fetching all coupons:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get available coupons for user (with subtotal validation)
router.post("/user/available", async (req, res) => {
  try {
    const { subtotal } = req.body;

    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },

      // ONLY ADMIN COUPONS
      $or: [
        { company: null },
        { company: "" },
        { vendorName: null },
        { vendorName: "" }
      ]
    }).sort({ createdAt: -1 });

    const validCoupons = coupons.filter(
      (coupon) => subtotal >= (coupon.minOrderAmount || 0)
    );

    res.json({
      success: true,
      coupons: validCoupons,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Validate coupon
router.post("/user/validate", async (req, res) => {
  const { code, subtotal } = req.body;

  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },

      // ONLY ADMIN COUPONS
      $or: [
        { company: null },
        { company: "" },
        { vendorName: null },
        { vendorName: "" }
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid Admin Coupon",
      });
    }

    if (
      coupon.minOrderAmount &&
      subtotal < coupon.minOrderAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ₹${coupon.minOrderAmount}`,
      });
    }

    let discountAmount = 0;

    if ((coupon.discountType || coupon.type) === "percentage") {
      discountAmount =
        subtotal *
        ((coupon.discountValue || coupon.discount) / 100);

      if (
        coupon.maxDiscount &&
        discountAmount > coupon.maxDiscount
      ) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(
        coupon.discountValue || coupon.discount,
        subtotal
      );
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType || coupon.type,
        discountValue: coupon.discountValue || coupon.discount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.post("/user/apply", async (req, res) => {
  try {
    const { guestId, code } = req.body;

    const cart = await Cart.findOne({ guestId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const subtotal = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },

      // ONLY ADMIN COUPONS
      $or: [
        { company: null },
        { company: "" },
        { vendorName: null },
        { vendorName: "" }
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Only Admin Coupons Allowed",
      });
    }

    let discountAmount = 0;

    if ((coupon.discountType || coupon.type) === "percentage") {
      discountAmount =
        subtotal *
        ((coupon.discountValue || coupon.discount) / 100);

      if (
        coupon.maxDiscount &&
        discountAmount > coupon.maxDiscount
      ) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(
        coupon.discountValue || coupon.discount,
        subtotal
      );
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discountType: coupon.discountType || coupon.type,
      discountValue: coupon.discountValue || coupon.discount,
      discountAmount,
    };

    await cart.save();

    res.json({
      success: true,
      appliedCoupon: cart.appliedCoupon,
      subtotal,
      discountAmount,
      finalTotal: subtotal - discountAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
router.delete("/user/remove/:guestId", async (req, res) => {
  try {
    const cart = await Cart.findOne({
      guestId: req.params.guestId
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    cart.appliedCoupon = undefined;

    await cart.save();

    res.json({
      success: true,
      message: "Coupon removed"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Coupon routes are working!" });
});

module.exports = router;