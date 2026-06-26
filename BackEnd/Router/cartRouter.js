const express = require("express");
const Cart = require("../Models/Cart");

const router = express.Router();

/* =====================================
   GET CART BY GUEST ID
===================================== */
router.get("/:guestId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ guestId: req.params.guestId });
    res.json(cart || { guestId: req.params.guestId, items: [] });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/* =====================================
   ADD / UPDATE CART ITEM (Supports Both Formats)
===================================== */
router.post("/add", async (req, res) => {
  const { guestId, productId, quantity, name, price, image, product } = req.body;

  // // console.log("📦 Add to cart request:", req.body);

  // ✅ Support both formats
  let productData = product;
  
  // If product object not provided, use flat fields
  if (!productData && productId) {
    productData = {
      productId: productId,
      name: name || "Product",
      price: price || 0,
      image: image || [],
      quantity: quantity || 1,
    };
  }

  if (!guestId || !productData?.productId) {
    return res.status(400).json({ 
      success: false,
      message: "guestId and productId required" 
    });
  }

  try {
    let cart = await Cart.findOne({ guestId });

    if (!cart) {
      cart = new Cart({ guestId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productData.productId
    );

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += productData.quantity || 1;
    } else {
      // Add new item
      cart.items.push({
        productId: productData.productId,
        name: productData.name || "Product",
        price: productData.price || 0,
        image: productData.image || [],
        quantity: productData.quantity || 1,
      });
    }

    await cart.save();
    
          // console.log("✅ Cart updated:", cart);
    
    res.json({
      success: true,
      message: "Added to cart",
      cart: cart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
});

/* =====================================
   REMOVE ITEM FROM CART
===================================== */
router.delete("/remove/:guestId/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ guestId: req.params.guestId });

    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: "Cart not found" 
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();
    res.json({
      success: true,
      message: "Item removed from cart",
      cart: cart,
    });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

/* =====================================
   CLEAR CART
===================================== */
router.delete("/clear/:guestId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ guestId: req.params.guestId });
    res.json({ 
      success: true,
      message: "Cart cleared" 
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

module.exports = router;