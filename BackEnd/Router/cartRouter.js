// Router/cartRouter.js — with STOCK VALIDATION + DECREMENT SUPPORT
const express = require("express");
const router = express.Router();
const Cart = require("../Models/Cart");
const Product = require("../Models/Product");

// ============================================================
// ADD / UPDATE ITEM IN CART — with STOCK VALIDATION
// ============================================================
router.post("/add", async (req, res) => {
  try {
    const { guestId, product } = req.body;

    if (!guestId || !product || !product.productId) {
      return res.status(400).json({
        success: false,
        message: "guestId and product required",
      });
    }

    // ✅ STEP 1: Load the real product
    const dbProduct = await Product.findById(product.productId);
    if (!dbProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ STEP 2: Check if product is active
    if (dbProduct.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable.",
      });
    }

    // ✅ STEP 3: Determine effective stock (variant-aware)
    let effectiveStock = Number(dbProduct.stock) || 0;
    let variantMatched = null;

    if (product.variantId && Array.isArray(dbProduct.variants)) {
      variantMatched = dbProduct.variants.find(
        (v) => v._id && v._id.toString() === product.variantId.toString()
      );
      if (variantMatched) {
        effectiveStock = Number(variantMatched.stock) || 0;

        if (variantMatched.isAvailable === false) {
          return res.status(400).json({
            success: false,
            message: "This variant is currently unavailable.",
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Selected variant not found.",
        });
      }
    }

    // ✅ STEP 4: Load / create cart
    let cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = new Cart({ guestId, items: [], appliedCoupon: null });
    }

    // ✅ STEP 5: Find existing cart item (variant-aware)
    const existingIndex = cart.items.findIndex((item) => {
      const sameProduct =
        item.productId.toString() === product.productId.toString();

      const itemVariant = item.variantId ? item.variantId.toString() : null;
      const newVariant = product.variantId
        ? product.variantId.toString()
        : null;

      if (itemVariant && newVariant) {
        return sameProduct && itemVariant === newVariant;
      }

      const sameColor =
        (item.selectedColor || "") === (product.selectedColor || "");
      const sameSize =
        (item.selectedSize || "") === (product.selectedSize || "");

      return sameProduct && !itemVariant && !newVariant && sameColor && sameSize;
    });

    // ================= REQUESTED QTY =================
    // 🆕 Read requested quantity as-is (can be negative for decrement)
    let requestedQty = Number(product.quantity);
    if (!Number.isFinite(requestedQty)) requestedQty = 1;

    // 🆕 Block ZERO quantity (which means nothing to do)
    if (requestedQty === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
      });
    }

    // 🆕 Only allow negative qty (decrement) for EXISTING items
    if (requestedQty < 0 && existingIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
      });
    }

    // 🆕 For NEW items or increments, block out-of-stock BEFORE modifying cart
    if (requestedQty > 0 && effectiveStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Sorry, this product is out of stock.",
      });
    }

    if (existingIndex > -1) {
      // ============ UPDATE EXISTING ITEM ============
      const currentQty = cart.items[existingIndex].quantity || 0;
      const newQty = currentQty + requestedQty;

      if (newQty <= 0) {
        // Removing item (decrement to 0 or below)
        cart.items.splice(existingIndex, 1);
      } else {
        // 🆕 STOCK CHECK: new total cannot exceed effective stock
        if (newQty > effectiveStock) {
          return res.status(400).json({
            success: false,
            message: `Only ${effectiveStock} item${effectiveStock === 1 ? "" : "s"
              } available in stock. You already have ${currentQty} in your cart.`,
          });
        }

        cart.items[existingIndex].quantity = newQty;

        // Refresh price/stock/custom field
        if (product.price) cart.items[existingIndex].price = product.price;
        cart.items[existingIndex].stock = effectiveStock;
        if (product.customFieldLabel !== undefined)
          cart.items[existingIndex].customFieldLabel = product.customFieldLabel;
        if (product.customFieldValue !== undefined)
          cart.items[existingIndex].customFieldValue = product.customFieldValue;
      }
    } else {
      // ============ ADD NEW ITEM ============
      if (requestedQty > effectiveStock) {
        return res.status(400).json({
          success: false,
          message: `Only ${effectiveStock} item${effectiveStock === 1 ? "" : "s"
            } available in stock.`,
        });
      }

      cart.items.push({
        productId: product.productId,
        name: product.name || dbProduct.name,
        price: product.price || dbProduct.price,
        originalPrice: product.originalPrice || product.price || dbProduct.price,
        discountAmount: product.discountAmount || 0,
        couponCode: product.couponCode || null,
        quantity: requestedQty,
        image: Array.isArray(product.image)
          ? product.image
          : [product.image],

        vendorId: product.vendorId || dbProduct.vendorId || null,
        company: product.company || dbProduct.company || "N/A",
        stock: effectiveStock,

        variantId: product.variantId || null,
        selectedColor: product.selectedColor || "",
        selectedSize: product.selectedSize || "",
        variantImage: product.variantImage || "",
        variantPrice: product.variantPrice || 0,

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
// REMOVE ITEM
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
        return !sameProduct;
      }

      const itemVariant = item.variantId ? item.variantId.toString() : null;
      const sameVariant = itemVariant === variantId;

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