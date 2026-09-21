  // routes/cart.js - UPDATED WITH CUSTOM FIELD SUPPORT
  const express = require("express");
  const router = express.Router();
  const Cart = require("../Models/Cart");

  // ============================================================
  // ADD / UPDATE ITEM IN CART
  // ============================================================
  router.post("/add", async (req, res) => {
    try {
      const { guestId, product } = req.body;

      if (!guestId || !product || !product.productId) {
        return res.status(400).json({ message: "guestId and product required" });
      }

      let cart = await Cart.findOne({ guestId });
      if (!cart) {
        cart = new Cart({ guestId, items: [], appliedCoupon: null });
      }

      // ✅ Find existing item — variant-aware match
      const existingIndex = cart.items.findIndex((item) => {
        const sameProduct =
          item.productId.toString() === product.productId.toString();

        const itemVariant = item.variantId ? item.variantId.toString() : null;
        const newVariant = product.variantId
          ? product.variantId.toString()
          : null;

        // Match by variantId if present, otherwise match by color+size
        if (itemVariant && newVariant) {
          return sameProduct && itemVariant === newVariant;
        }

        const sameColor =
          (item.selectedColor || "") === (product.selectedColor || "");
        const sameSize =
          (item.selectedSize || "") === (product.selectedSize || "");

        return sameProduct && !itemVariant && !newVariant && sameColor && sameSize;
      });

      if (existingIndex > -1) {
        // Update quantity
        const newQty = cart.items[existingIndex].quantity + (product.quantity || 1);

        if (newQty <= 0) {
          cart.items.splice(existingIndex, 1);
        } else {
          cart.items[existingIndex].quantity = newQty;

          // ✅ Refresh price/stock/custom field in case they changed
          if (product.price) cart.items[existingIndex].price = product.price;
          if (product.stock !== undefined) cart.items[existingIndex].stock = product.stock;
          if (product.customFieldLabel !== undefined)
            cart.items[existingIndex].customFieldLabel = product.customFieldLabel;
          if (product.customFieldValue !== undefined)
            cart.items[existingIndex].customFieldValue = product.customFieldValue;
        }
      } else {
        // ✅ Add new item — include ALL fields
        cart.items.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          discountAmount: product.discountAmount || 0,
          couponCode: product.couponCode || null,
          quantity: product.quantity || 1,
          image: Array.isArray(product.image) ? product.image : [product.image],

          // Vendor
          vendorId: product.vendorId || null,
          company: product.company || "N/A",
          stock: product.stock || 0,

          // Variant
          variantId: product.variantId || null,
          selectedColor: product.selectedColor || "",
          selectedSize: product.selectedSize || "",
          variantImage: product.variantImage || "",
          variantPrice: product.variantPrice || 0,

          // 🆕 Custom field
          customFieldLabel: product.customFieldLabel || null,
          customFieldValue: product.customFieldValue || null,
        });
      }

      await cart.save();
      res.json({ success: true, cart });
    } catch (err) {
      console.error("Cart add error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ============================================================
  // GET CART
  // ============================================================
  router.get("/:guestId", async (req, res) => {
    try {
      const cart = await Cart.findOne({ guestId: req.params.guestId });
      if (!cart) {
        return res.json({ items: [], appliedCoupon: null });
      }
      res.json(cart);
    } catch (err) {
      console.error("Cart fetch error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // ============================================================
  // REMOVE ITEM — variant-aware
  // ============================================================
  router.delete("/remove/:guestId/:productId", async (req, res) => {
    try {
      const { guestId, productId } = req.params;
      const { variantId } = req.query;

      const cart = await Cart.findOne({ guestId });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      cart.items = cart.items.filter((item) => {
        const sameProduct = item.productId.toString() === productId;

        if (!variantId) {
          // Remove all matches (legacy behaviour)
          return !sameProduct;
        }

        const itemVariant = item.variantId ? item.variantId.toString() : null;
        const sameVariant = itemVariant === variantId;

        // Keep items that DON'T match product+variant
        return !(sameProduct && sameVariant);
      });

      await cart.save();
      res.json({ success: true, cart });
    } catch (err) {
      console.error("Cart remove error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  // ============================================================
  // CLEAR CART
  // ============================================================
  router.delete("/clear/:guestId", async (req, res) => {
    try {
      await Cart.findOneAndUpdate(
        { guestId: req.params.guestId },
        { items: [], appliedCoupon: null }
      );
      res.json({ success: true });
    } catch (err) {
      console.error("Cart clear error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;