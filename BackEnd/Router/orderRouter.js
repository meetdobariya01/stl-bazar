// Router/orderRouter.js - FIXED: Company now shows correctly
const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Vendor = require("../Models/Vendor");
const Product = require("../Models/Product");
const axios = require("axios");
const { 
  sendEmail, 
  getCustomerOrderEmail, 
  getAdminOrderEmail, 
  getVendorOrderEmail,
  emailMode 
} = require("../Comfig/emailConfig");

const VENDOR_API_URL = process.env.VENDOR_API_URL || "https://api.brandelvendor.starlighttechlabsindia.com/api";

// ============================================
// PLACE ORDER WITH EMAIL & VENDOR NOTIFICATIONS
// ============================================
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({ 
      success: false,
      message: "Incomplete data" 
    });
  }

  try {
    // Fetch cart items
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Cart is empty" 
      });
    }

    // ✅ FIX: Get full product details including vendor company
    const itemsWithVendorInfo = await Promise.all(
      cart.items.map(async (item) => {
        // Find product and populate vendor
        const product = await Product.findById(item.productId).populate('vendorId', 'company name email');
        
        // Get company from product or vendor
        let company = null;
        
        // First check if product has company field
        if (product && product.company) {
          company = product.company;
        }
        // Then check if vendor has company
        else if (product && product.vendorId) {
          // If vendor is populated, get company from vendor
          if (product.vendorId.company) {
            company = product.vendorId.company;
          }
        }
        
        // If still no company, try to get from vendor directly
        if (!company && product && product.vendorId) {
          const vendor = await Vendor.findById(product.vendorId._id || product.vendorId);
          if (vendor && vendor.company) {
            company = vendor.company;
          }
        }
        
        console.log(`Product: ${item.name}, Company: ${company}`); // Debug log
        
        return {
          productId: item.productId,
          name: item.name || product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          image: Array.isArray(item.image) ? item.image[0] : (item.image || product?.image?.[0] || null),
          vendorId: product?.vendorId?._id || product?.vendorId || null,
          company: company || "N/A", // ← Set company
        };
      })
    );

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Create order with company included
    const order = new Order({
      guestId,
      items: itemsWithVendorInfo,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      totalPrice,
      orderStatus: "Pending",
    });

    await order.save();
    await Cart.findOneAndDelete({ guestId });

    const orderId = order._id;
    
    // ============================================
    // EMAIL RESULTS
    // ============================================
    const emailResults = {
      customer: false,
      admin: false,
      vendors: []
    };
    
    // ============================================
    // 1. SEND EMAIL TO CUSTOMER
    // ============================================
    const customerEmail = shippingAddress.email;
    if (customerEmail) {
      try {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        const result = await sendEmail(
          customerEmail, 
          `Order Confirmed! - Order #${orderId}`, 
          customerHtml
        );
        emailResults.customer = result.success;
      } catch (error) {
        console.error("Error sending customer email:", error.message);
      }
    }
    
    // ============================================
    // 2. SEND EMAIL TO ADMIN
    // ============================================
    const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
    if (adminEmail) {
      try {
        const adminHtml = getAdminOrderEmail(order, orderId);
        const result = await sendEmail(
          adminEmail, 
          `New Order Received - Order #${orderId}`, 
          adminHtml
        );
        emailResults.admin = result.success;
      } catch (error) {
        console.error("Error sending admin email:", error.message);
      }
    }
    
    // ============================================
    // 3. GROUP ITEMS BY VENDOR (Company wise)
    // ============================================
    const vendorGroups = new Map();
    
    for (const item of itemsWithVendorInfo) {
      if (item.company && item.company !== "N/A") {
        const company = item.company;
        if (!vendorGroups.has(company)) {
          vendorGroups.set(company, {
            company: company,
            items: [],
            vendorId: item.vendorId,
          });
        }
        vendorGroups.get(company).items.push(item);
      }
    }
    
    // ============================================
    // 4. SEND EMAIL TO EACH VENDOR
    // ============================================
    for (const [company, vendorData] of vendorGroups) {
      try {
        let vendor = null;
        let vendorEmail = null;
        let vendorName = company;
        
        // Search in vendors collection
        vendor = await Vendor.findOne({ 
          company: company
        }).select("email name company phone");
        
        // Case insensitive
        if (!vendor) {
          vendor = await Vendor.findOne({ 
            company: { $regex: new RegExp(`^${company}$`, "i") }
          }).select("email name company phone");
        }
        
        if (vendor) {
          vendorEmail = vendor.email;
          vendorName = vendor.name || company;
        }
        
        if (vendorEmail) {
          const vendorItems = vendorData.items;
          const vendorHtml = getVendorOrderEmail(order, orderId, vendorItems, { 
            name: vendorName,
            email: vendorEmail,
            shopName: company,
            phone: vendor?.phone || "N/A",
          });
          
          const result = await sendEmail(
            vendorEmail, 
            `New Order Received for ${company} - Order #${orderId}`, 
            vendorHtml
          );
          
          emailResults.vendors.push({
            company: company,
            email: vendorEmail,
            success: result.success
          });
        } else {
          emailResults.vendors.push({
            company: company,
            success: false,
            error: "No email found"
          });
        }
      } catch (vendorErr) {
        console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
        emailResults.vendors.push({
          company: company,
          success: false,
          error: vendorErr.message
        });
      }
    }

    // ============================================
    // 5. CREATE VENDOR NOTIFICATIONS
    // ============================================
    const notificationResults = [];
    
    for (const [company, vendorData] of vendorGroups) {
      try {
        const vendorItems = vendorData.items;
        const vendorTotal = vendorItems.reduce((sum, item) => {
          return sum + (item.price || 0) * (item.quantity || 1);
        }, 0);

        const notificationData = {
          company: company,
          title: "🛒 New Order Received!",
          message: `You have received a new order #${orderId.toString().slice(-6)}.\n\n` +
                   `Total Amount: ₹${vendorTotal}\n` +
                   `Items: ${vendorItems.length} product(s)\n` +
                   `Customer: ${shippingAddress?.name || "Customer"}\n` +
                   `Phone: ${shippingAddress?.phone || "N/A"}\n` +
                   `Order Date: ${new Date().toLocaleString()}\n\n` +
                   `Please check and process the order.`,
          read: false,
          orderId: orderId,
        };

        await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });
        
        notificationResults.push({ 
          company, 
          success: true
        });
        
      } catch (vendorError) {
        console.error(`Failed to create notification for ${company}:`, vendorError.message);
        notificationResults.push({ 
          company, 
          success: false, 
          error: vendorError.message 
        });
      }
    }

    // ============================================
    // 6. RESPONSE
    // ============================================
    res.json({ 
      success: true,
      message: "Order placed successfully", 
      orderId: order._id,
      emailResults: emailResults,
      notificationResults: notificationResults,
      vendorCount: vendorGroups.size,
      emailMode: emailMode
    });
    
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
});

// ============================================
// GET SINGLE ORDER BY ID
// ============================================
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

// ============================================
// GET ORDERS BY GUEST ID
// ============================================
router.get("/guest/:guestId", async (req, res) => {
  try {
    const orders = await Order.find({ guestId: req.params.guestId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// GET USER ORDERS
// ============================================
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// SEND ORDER CONFIRMATION EMAIL
// ============================================
router.post("/send-confirmation", async (req, res) => {
  try {
    const {
      to,
      subject,
      orderId,
      customerName,
      items,
      subtotal,
      couponDiscount,
      shippingCost,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      orderDate
    } = req.body;

    if (!to) {
      return res.status(400).json({ 
        success: false,
        message: "Recipient email is required" 
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
          .header p { color: #e8f5e9; margin: 5px 0 0; }
          .order-details { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745; }
          .order-details p { margin: 5px 0; }
          .order-details strong { color: #28a745; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
          .total-row { font-weight: bold; font-size: 18px; }
          .total-amount { color: #28a745; font-size: 24px; }
          .badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px; }
          .shipping-info { margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          .free-shipping { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order, ${customerName || 'Customer'}!</p>
          </div>

          <div style="padding: 20px;">
            <div class="order-details">
              <p><strong>📋 Order #:</strong> ${orderId}</p>
              <p><strong>📅 Order Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
              <p><strong>💳 Payment Method:</strong> ${paymentMethod || 'COD'}</p>
              <p><strong>🚚 Shipping Method:</strong> ${shippingMethod || 'Standard'}</p>
              <p><strong>📦 Status:</strong> <span class="badge">Pending</span></p>
            </div>

            <h3>🛍️ Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td style="text-align: right;">₹${(item.price || 0).toFixed(2)}</td>
                    <td style="text-align: right;">₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 15px; border-top: 2px solid #eee; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>Subtotal</span>
                <span>₹${(subtotal || 0).toFixed(2)}</span>
              </div>
              ${couponDiscount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #28a745;">
                <span>🎟️ Coupon Discount</span>
                <span>-₹${(couponDiscount || 0).toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>🚚 Shipping</span>
                <span>${shippingCost === 0 ? '<span class="free-shipping">FREE</span>' : `₹${(shippingCost || 0).toFixed(2)}`}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 20px; font-weight: bold; border-top: 2px solid #28a745;">
                <span>Total</span>
                <span style="color: #28a745;">₹${(total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div class="shipping-info">
              <h4>📦 Shipping Address</h4>
              <p><strong>Name:</strong> ${shippingAddress?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> ${shippingAddress?.phone || 'N/A'}</p>
              <p><strong>Address:</strong> ${shippingAddress?.address || 'N/A'}</p>
              <p><strong>City:</strong> ${shippingAddress?.city || 'N/A'}</p>
              <p><strong>State:</strong> ${shippingAddress?.state || 'N/A'}</p>
              <p><strong>Pincode:</strong> ${shippingAddress?.pincode || 'N/A'}</p>
            </div>

            <div class="footer">
              <p>Thank you for shopping with us! 🛍️</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="font-size: 12px; color: #999;">This is a system generated email. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);

    if (result.success) {
      res.json({
        success: true,
        message: "Email sent successfully",
        previewUrl: result.previewUrl || null,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error || "Unknown error",
      });
    }

  } catch (err) {
    console.error("Send confirmation error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;