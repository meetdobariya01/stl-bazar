const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const User = require("../Models/User");
const Product = require("../Models/Product");
const { 
  sendEmail, 
  getCustomerOrderEmail, 
  getAdminOrderEmail, 
  getVendorOrderEmail,
  emailMode 
} = require("../Comfig/emailConfig");

// Place an order with email notifications
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({ message: "Incomplete data" });
  }

  try {
    // Fetch cart items
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Get full product details including vendor information
    const itemsWithVendorInfo = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: Array.isArray(item.image) ? item.image[0] : item.image, // ✅ FIX: Take first image if array
          vendorId: product?.vendorId || null,
          company: product?.company || null,
        };
      })
    );

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      guestId,
      items: itemsWithVendorInfo,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalPrice,
      orderStatus: "Pending",
    });

    await order.save();

    // Clear cart after placing order
    await Cart.findOneAndDelete({ guestId });

    const orderId = order._id;
    
    // ============================================
    // SEND EMAIL NOTIFICATIONS (with error handling)
    // ============================================
    
    const emailResults = {
      customer: false,
      admin: false,
      vendors: []
    };
    
    // 1. Send email to CUSTOMER
    const customerEmail = shippingAddress.email;
    if (customerEmail) {
      try {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
        emailResults.customer = result.success;
        if (result.previewUrl) {
          console.log(`📧 Customer Email Preview: ${result.previewUrl}`);
        }
      } catch (error) {
        console.error("Error sending customer email:", error.message);
      }
    } else {
      console.log("⚠️ No customer email provided");
    }
    
    // 2. Send email to SUPER ADMIN
    const adminEmail = process.env.ADMIN_EMAIL || "admin@yourstore.com";
    if (adminEmail) {
      try {
        const adminHtml = getAdminOrderEmail(order, orderId);
        const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
        emailResults.admin = result.success;
        if (result.previewUrl) {
          console.log(`📧 Admin Email Preview: ${result.previewUrl}`);
        }
      } catch (error) {
        console.error("Error sending admin email:", error.message);
      }
    }
    
    // 3. Send email to VENDORS (group items by vendor)
    const vendorGroups = new Map();
    
    for (const item of itemsWithVendorInfo) {
      if (item.vendorId) {
        const vendorIdStr = item.vendorId.toString();
        if (!vendorGroups.has(vendorIdStr)) {
          vendorGroups.set(vendorIdStr, {
            vendorId: item.vendorId,
            items: [],
            company: item.company
          });
        }
        vendorGroups.get(vendorIdStr).items.push(item);
      }
    }
    
    // Send separate email to each vendor
    for (const [vendorId, vendorData] of vendorGroups) {
      try {
        // Fetch vendor details from database
        const vendor = await User.findById(vendorId).select("name email shopName phone role company");
        
        if (vendor && vendor.email) {
          const vendorHtml = getVendorOrderEmail(order, orderId, vendorData.items, vendor);
          const result = await sendEmail(
            vendor.email, 
            `New Order Received for Your Products - Order #${orderId}`, 
            vendorHtml
          );
          emailResults.vendors.push({
            email: vendor.email,
            name: vendor.name,
            success: result.success
          });
          if (result.previewUrl) {
            console.log(`📧 Vendor Email Preview (${vendor.email}): ${result.previewUrl}`);
          }
        } else {
          console.log(`⚠️ Vendor not found or has no email for ID: ${vendorId}`);
          emailResults.vendors.push({
            vendorId,
            success: false,
            error: "Vendor not found or no email"
          });
        }
      } catch (vendorErr) {
        console.error(`Error processing vendor ${vendorId}:`, vendorErr.message);
        emailResults.vendors.push({
          vendorId,
          success: false,
          error: vendorErr.message
        });
      }
    }

    res.json({ 
      message: "Order placed successfully", 
      orderId: order._id,
      emailResults,
      emailMode: emailMode // Let frontend know which email mode is active
    });
    
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
});

// Get single order by ID
router.get("/single/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get orders by guestId
router.get("/guest/:guestId", async (req, res) => {
  try {
    const orders = await Order.find({ guestId: req.params.guestId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user orders (for authenticated users)
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;