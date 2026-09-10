const express = require("express");
const Cart = require("../Models/Cart");

const router = express.Router();

router.get("/:guestId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ guestId: req.params.guestId });
    res.json(cart || { guestId: req.params.guestId, items: [] });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {
      guestId,
      productId,
      quantity,
      name,
      price,
      image,
      product,
      originalPrice,
      discountAmount,
      couponCode,
      variantId: flatVariantId,
      selectedColor: flatSelectedColor,
      selectedSize: flatSelectedSize,
      variantImage: flatVariantImage,
      variantPrice: flatVariantPrice,
      stock: flatStock,
      company: flatCompany,
      vendorId: flatVendorId,
    } = req.body;

    let productData = product;
    if (!productData && productId) {
      productData = {
        productId,
        name: name || "Product",
        price: price || 0,
        image: image || [],
        quantity: quantity || 1,
        originalPrice,
        discountAmount,
        couponCode,
        variantId: flatVariantId || null,
        selectedColor: flatSelectedColor || "",
        selectedSize: flatSelectedSize || "",
        variantImage: flatVariantImage || "",
        variantPrice: flatVariantPrice || 0,
        stock: flatStock || 0,
        company: flatCompany || "N/A",
        vendorId: flatVendorId || null,
      };
    }

    if (!guestId || !productData?.productId) {
      return res.status(400).json({
        success: false,
        message: "guestId and productId required",
      });
    }

    let cart = await Cart.findOne({ guestId });
    if (!cart) {
      cart = new Cart({ guestId, items: [] });
    }

    const rawNewVariantId = productData.variantId;
    const newVariantId =
      rawNewVariantId &&
      String(rawNewVariantId).trim() !== "" &&
      String(rawNewVariantId) !== "null" &&
      String(rawNewVariantId) !== "undefined"
        ? String(rawNewVariantId).trim()
        : null;

    const newProductId = String(productData.productId);

    console.log("🔍 Cart add debug:", {
      newProductId,
      newVariantId,
      price: productData.price,
      existingItems: cart.items.length,
    });

    const itemIndex = cart.items.findIndex((item) => {
      const sameProduct = String(item.productId) === newProductId;

      const rawItemVariantId = item.variantId;
      const itemVariantId =
        rawItemVariantId &&
        String(rawItemVariantId).trim() !== "" &&
        String(rawItemVariantId) !== "null" &&
        String(rawItemVariantId) !== "undefined"
          ? String(rawItemVariantId).trim()
          : null;

      const match = sameProduct && itemVariantId === newVariantId;

      console.log("  Compare:", {
        itemVariantId,
        newVariantId,
        sameProduct,
        variantMatch: itemVariantId === newVariantId,
        finalMatch: match,
      });

      return match;
    });

    if (itemIndex > -1) {
      const currentQty = cart.items[itemIndex].quantity;
      const delta = productData.quantity || 1;
      const newQty = currentQty + delta;

      if (newQty < 1) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = newQty;

        if (productData.price !== undefined) {
          cart.items[itemIndex].price = productData.price;
        }

        if (newVariantId) {
          cart.items[itemIndex].variantId = newVariantId;
          cart.items[itemIndex].selectedColor = productData.selectedColor || "";
          cart.items[itemIndex].selectedSize = productData.selectedSize || "";
          cart.items[itemIndex].variantImage = productData.variantImage || "";
          cart.items[itemIndex].variantPrice = productData.variantPrice || 0;
        }
      }
    } else {
      if ((productData.quantity || 1) > 0) {
        cart.items.push({
          productId: productData.productId,
          name: productData.name,
          price: productData.price,
          originalPrice: originalPrice || productData.originalPrice || productData.price,
          discountAmount: discountAmount || productData.discountAmount || 0,
          couponCode: couponCode || productData.couponCode || "",
          quantity: productData.quantity || 1,
          image: Array.isArray(productData.image)
            ? productData.image
            : [productData.image].filter(Boolean),
          vendorId: productData.vendorId || null,
          company: productData.company || "N/A",
          stock: productData.stock || 0,
          variantId: newVariantId,
          selectedColor: productData.selectedColor || "",
          selectedSize: productData.selectedSize || "",
          variantImage: productData.variantImage || "",
          variantPrice: productData.variantPrice || 0,
        });
      }
    }

    await cart.save();
    res.json({ success: true, message: "Added to cart", cart });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/remove/:guestId/:productId", async (req, res) => {
  try {
    const { guestId, productId } = req.params;
    const { variantId } = req.query;

    const cart = await Cart.findOne({ guestId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    if (variantId) {
      cart.items = cart.items.filter(
        (item) =>
          !(
            String(item.productId) === productId &&
            item.variantId &&
            String(item.variantId) === variantId
          )
      );
    } else {
      cart.items = cart.items.filter(
        (item) => String(item.productId) !== productId
      );
    }

    await cart.save();
    res.json({ success: true, message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/clear/:guestId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ guestId: req.params.guestId });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;