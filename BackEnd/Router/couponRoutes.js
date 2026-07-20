  // routes/couponRoutes.js
  const express = require("express");
  const router = express.Router();
  const Coupon = require("../Models/Coupon");
  const Cart = require("../Models/Cart"); 
  // ========== PUBLIC COUPON ENDPOINTS ==========

  // Get coupons for a specific product
  // Get coupons for a specific product - Updated
  // Get coupons for a specific product - Updated
  // Get coupons for a specific product - Updated to ONLY show product-specific coupons
  // Get coupons for a specific product - Updated to use 'products' field
  router.get("/public/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      
      console.log(`Fetching coupons for product: ${productId}`);
      
      // First, get the product to know its vendor/company
      const Product = require("../Models/Product");
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      // Get the vendor name from the product
      const vendorName = product.company || product.vendor || product.vendorName;
      
      // IMPORTANT: Check BOTH 'products' and 'productIds' fields
      // Use 'products' as the primary field since that's where your data is
      const query = {
        isActive: true,
        expiryDate: { $gte: new Date() },
        // Must have products array that includes this specific product
        $or: [
          { products: { $in: [productId] } },
          { productIds: { $in: [productId] } } // For backward compatibility
        ],
        // Must belong to this vendor
        $or: [
          { company: vendorName },
          { vendorName: vendorName }
        ]
      };
      
      const coupons = await Coupon.find(query).sort({ createdAt: -1 });

      console.log(`Found ${coupons.length} coupons specifically for product ${productId} from vendor ${vendorName}`);
      
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
          isActive: c.isActive,
          products: c.products || [], // Include products in response
          productIds: c.productIds || [] // Include productIds in response
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
  // Get coupons by company name - Updated
  // Get coupons by company name - Updated with product filtering using 'products' field
  router.get("/public/company/:companyName", async (req, res) => {
    try {
      const { companyName } = req.params;
      const { productId } = req.query; // Get productId from query params
      
      console.log(`Fetching coupons for company: ${companyName}`);
      console.log(`Product ID filter: ${productId || 'none'}`);
      
      // Build the base query
      const baseQuery = {
        isActive: true,
        expiryDate: { $gte: new Date() },
        $or: [
          { company: { $regex: new RegExp(`^${companyName}$`, 'i') } },
          { vendorName: { $regex: new RegExp(`^${companyName}$`, 'i') } }
        ]
      };
      
      // If productId is provided, add product filtering
      if (productId) {
        // Find coupons that either have no product restriction OR include this product
        const coupons = await Coupon.find({
          ...baseQuery,
          $or: [
            // No product restriction (applies to all products)
            { products: { $exists: false } },
            { products: [] },
            { productIds: { $exists: false } },
            { productIds: [] },
            // OR includes this specific product in either field
            { products: { $in: [productId] } },
            { productIds: { $in: [productId] } }
          ]
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${coupons.length} coupons for company ${companyName} filtered by product`);
        
        return res.json({
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
            isActive: c.isActive,
            products: c.products || [],
            productIds: c.productIds || []
          }))
        });
      }
      
      // If no productId, return all company coupons
      const coupons = await Coupon.find(baseQuery).sort({ createdAt: -1 });

      console.log(`Found ${coupons.length} coupons for company ${companyName}`);
      
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
          isActive: c.isActive,
          products: c.products || [],
          productIds: c.productIds || []
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
      const { guestId, code, productId } = req.body;

      console.log(`Applying coupon ${code} for guest ${guestId}, product ${productId}`);

      const cart = await Cart.findOne({ guestId });

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found. Please add items to cart first.",
        });
      }

      // Get the coupon
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Invalid coupon code",
        });
      }

      // CRITICAL: Validate coupon is for the specific product
      // Check BOTH 'products' and 'productIds' fields
      const hasProducts = (coupon.products && coupon.products.length > 0) || 
                        (coupon.productIds && coupon.productIds.length > 0);
      
      if (hasProducts) {
        // Check both arrays
        const productIds = [...(coupon.products || []), ...(coupon.productIds || [])];
        const isProductValid = productIds.some(id => id.toString() === productId);
        
        if (!isProductValid) {
          return res.status(400).json({
            success: false,
            message: "This coupon is not valid for this product",
          });
        }
      }

      // Check if coupon has vendor restriction
      if (coupon.vendorId || coupon.company || coupon.vendorName) {
        const Product = require("../Models/Product");
        const product = await Product.findById(productId);
        
        if (product) {
          const productVendor = product.company || product.vendor || product.vendorName;
          const couponVendor = coupon.company || coupon.vendorName;
          
          if (couponVendor && productVendor && 
              couponVendor.toLowerCase() !== productVendor.toLowerCase()) {
            return res.status(400).json({
              success: false,
              message: "This coupon belongs to a different vendor",
            });
          }
        }
      }

      // Calculate subtotal
      const subtotal = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Validate minimum order
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount ₹${coupon.minOrderAmount} required`,
        });
      }

      // Calculate discount
      let discountAmount = 0;
      const discountType = coupon.discountType || coupon.type || 'percentage';
      const discountValue = coupon.discountValue || coupon.discount || 0;

      if (discountType === "percentage") {
        discountAmount = subtotal * (discountValue / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = Math.min(discountValue, subtotal);
      }

      // Apply coupon to cart
      cart.appliedCoupon = {
        code: coupon.code,
        discountType: discountType,
        discountValue: discountValue,
        discountAmount: discountAmount,
        productId: productId
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
      console.error("Apply coupon error:", err);
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