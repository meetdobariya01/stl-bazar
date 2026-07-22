// Router/orderRouter.js - UPDATED WITH COUPON SUPPORT
const express = require("express");
const router = express.Router();
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Vendor = require("../Models/Vendor");
const Product = require("../Models/Product");
const Coupon = require("../Models/Coupon"); // ✅ Import Coupon model
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
  const { guestId, shippingAddress, paymentMethod, couponCode } = req.body; // ✅ Added couponCode

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

    // Get full product details including vendor company and vendorId
    const itemsWithVendorInfo = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId)
          .populate({
            path: 'vendorId',
            select: 'company name email _id'
          });
        
        let company = null;
        let vendorId = null;
        
        if (product?.vendorId) {
          if (product.vendorId._id) {
            vendorId = product.vendorId._id;
          } else if (typeof product.vendorId === 'string' || product.vendorId instanceof mongoose.Types.ObjectId) {
            vendorId = product.vendorId;
          } else {
            vendorId = product.vendorId;
          }
        }
        
        if (!vendorId && product?.vendor) {
          vendorId = product.vendor;
        }
        
        if (!vendorId && item.company) {
          const vendorByCompany = await Vendor.findOne({ 
            company: { $regex: new RegExp(`^${item.company}$`, "i") }
          });
          if (vendorByCompany) {
            vendorId = vendorByCompany._id;
          }
        }
        
        if (product && product.company) {
          company = product.company;
        } else if (product && product.vendorId) {
          if (product.vendorId.company) {
            company = product.vendorId.company;
          }
        } else if (product && product.vendor) {
          const vendorDoc = await Vendor.findById(product.vendor);
          if (vendorDoc && vendorDoc.company) {
            company = vendorDoc.company;
          }
        }
        
        if (!company && vendorId) {
          const vendor = await Vendor.findById(vendorId);
          if (vendor && vendor.company) {
            company = vendor.company;
          }
        }
        
        if (!company && item.company) {
          company = item.company;
        }
        
        return {
          productId: item.productId,
          name: item.name || product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          image: Array.isArray(item.image) ? item.image[0] : (item.image || product?.image?.[0] || null),
          vendorId: vendorId,
          company: company || "N/A",
        };
      })
    );

    // ✅ Calculate subtotal
    let subtotal = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let totalPrice = subtotal;
    let couponData = {
      code: null,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      couponId: null,
    };

    // ✅ APPLY COUPON IF PROVIDED
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (coupon) {
          // Check expiry
          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          
          // Check usage limit
          const usageLimitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
          
          // Check min order amount
          const minOrderNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

          if (!isExpired && !usageLimitReached && !minOrderNotMet) {
            let discountAmount = 0;
            
            if (coupon.discountType === "percentage") {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
              }
            } else {
              discountAmount = Math.min(coupon.discountValue, subtotal);
            }

            totalPrice = subtotal - discountAmount;

            couponData = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              discountAmount: Number(discountAmount.toFixed(2)),
              couponId: coupon._id,
            };

            // ✅ Increment coupon usage count
            coupon.usageCount = (coupon.usageCount || 0) + 1;
            await coupon.save();
          } else {
            console.log(`Coupon ${couponCode} validation failed:`, {
              expired: isExpired,
              usageLimitReached: usageLimitReached,
              minOrderNotMet: minOrderNotMet
            });
          }
        } else {
          console.log(`Coupon ${couponCode} not found or inactive`);
        }
      } catch (couponError) {
        console.error("Coupon validation error:", couponError);
      }
    }

    // Create order with coupon data
    const order = new Order({
      guestId,
      items: itemsWithVendorInfo,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      subtotal: subtotal,
      totalPrice: totalPrice,
      coupon: couponData,
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
        
        vendor = await Vendor.findOne({ 
          company: company
        }).select("email name company phone");
        
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
    // 6. RESPONSE - Include coupon info
    // ============================================
    res.json({ 
      success: true,
      message: "Order placed successfully", 
      orderId: order._id,
      order: {
        _id: order._id,
        subtotal: order.subtotal,
        totalPrice: order.totalPrice,
        coupon: order.coupon,
        discountApplied: order.coupon.discountAmount > 0,
      },
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
// ADMIN: GET ORDER WITH COMMISSION CALCULATION
// ============================================
router.get("/admin/commission/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    let totalAdminCommission = 0;
    let totalVendorCommission = 0;
    const vendorBreakdown = {};

    for (const item of order.items) {
      if (item.vendorId) {
        const vendorIdStr = item.vendorId.toString();
        const vendor = await Vendor.findById(item.vendorId).populate('planId');
        
        let commissionPercentage = 8;
        if (vendor && vendor.planId) {
          commissionPercentage = vendor.planId.commissionPercentage || 8;
        }

        const itemTotal = item.price * item.quantity;
        const vendorCommission = (itemTotal * commissionPercentage) / 100;
        const adminCommission = itemTotal - vendorCommission;

        totalVendorCommission += vendorCommission;
        totalAdminCommission += adminCommission;

        if (!vendorBreakdown[vendorIdStr]) {
          vendorBreakdown[vendorIdStr] = {
            company: item.company || 'Unknown',
            vendorId: item.vendorId,
            vendorName: vendor?.name || 'Unknown',
            vendorEmail: vendor?.email || 'N/A',
            commissionPercentage: commissionPercentage,
            items: [],
            totalItemValue: 0,
            totalVendorCommission: 0,
            totalAdminCommission: 0,
          };
        }

        vendorBreakdown[vendorIdStr].items.push({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: itemTotal,
          vendorCommission: vendorCommission,
          adminCommission: adminCommission,
        });
        
        vendorBreakdown[vendorIdStr].totalItemValue += itemTotal;
        vendorBreakdown[vendorIdStr].totalVendorCommission += vendorCommission;
        vendorBreakdown[vendorIdStr].totalAdminCommission += adminCommission;
      }
    }

    res.json({
      success: true,
      orderId: order._id,
      orderStatus: order.orderStatus,
      subtotal: order.subtotal || order.totalPrice,
      totalPrice: order.totalPrice,
      coupon: order.coupon || null,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      commissionSummary: {
        totalAdminCommission: totalAdminCommission,
        totalVendorCommission: totalVendorCommission,
        platformCommissionRate: order.totalPrice > 0 ? 
          ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + '%' : 
          '0%',
        vendorCommissionRate: order.totalPrice > 0 ?
          ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + '%' :
          '0%',
      },
      vendorBreakdown: Object.values(vendorBreakdown),
    });
  } catch (err) {
    console.error("Commission view error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
});

// ============================================
// ADMIN: GET ALL ORDERS WITH COMMISSIONS
// ============================================
router.get("/admin/commissions", async (req, res) => {
  try {
    const { startDate, endDate, vendorId, status } = req.query;
    
    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (status) {
      filter.orderStatus = status;
    }
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    const orderSummaries = [];
    let totalAdminCommission = 0;
    let totalVendorCommission = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      let orderAdminCommission = 0;
      let orderVendorCommission = 0;
      const vendorSet = new Set();

      for (const item of order.items) {
        if (item.vendorId) {
          vendorSet.add(item.vendorId.toString());
          
          const vendor = await Vendor.findById(item.vendorId).populate('planId');
          
          let commissionPercentage = 8;
          if (vendor && vendor.planId) {
            commissionPercentage = vendor.planId.commissionPercentage || 8;
          }

          const itemTotal = item.price * item.quantity;
          const vendorCommission = (itemTotal * commissionPercentage) / 100;
          const adminCommission = itemTotal - vendorCommission;

          orderVendorCommission += vendorCommission;
          orderAdminCommission += adminCommission;
        }
      }

      totalAdminCommission += orderAdminCommission;
      totalVendorCommission += orderVendorCommission;
      totalRevenue += order.totalPrice || 0;

      orderSummaries.push({
        _id: order._id,
        subtotal: order.subtotal || order.totalPrice,
        totalPrice: order.totalPrice,
        coupon: order.coupon || null,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        vendorCount: vendorSet.size,
        adminCommission: orderAdminCommission,
        vendorCommission: orderVendorCommission,
        platformCommissionRate: order.totalPrice > 0 ? 
          ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + '%' : 
          '0%',
      });
    }

    let filteredSummaries = orderSummaries;
    if (vendorId) {
      const filteredOrders = await Order.find({
        ...filter,
        'items.vendorId': vendorId
      }).sort({ createdAt: -1 });
      
      const filteredResults = [];
      let filteredAdminCommission = 0;
      let filteredVendorCommission = 0;
      let filteredRevenue = 0;
      
      for (const order of filteredOrders) {
        let orderAdminCommission = 0;
        let orderVendorCommission = 0;
        const vendorSet = new Set();

        for (const item of order.items) {
          if (item.vendorId && item.vendorId.toString() === vendorId) {
            vendorSet.add(item.vendorId.toString());
            
            const vendor = await Vendor.findById(item.vendorId).populate('planId');
            let commissionPercentage = 8;
            if (vendor && vendor.planId) {
              commissionPercentage = vendor.planId.commissionPercentage || 8;
            }

            const itemTotal = item.price * item.quantity;
            const vendorCommission = (itemTotal * commissionPercentage) / 100;
            const adminCommission = itemTotal - vendorCommission;

            orderVendorCommission += vendorCommission;
            orderAdminCommission += adminCommission;
          }
        }

        filteredAdminCommission += orderAdminCommission;
        filteredVendorCommission += orderVendorCommission;
        filteredRevenue += order.totalPrice || 0;

        filteredResults.push({
          _id: order._id,
          subtotal: order.subtotal || order.totalPrice,
          totalPrice: order.totalPrice,
          coupon: order.coupon || null,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          vendorCount: vendorSet.size,
          adminCommission: orderAdminCommission,
          vendorCommission: orderVendorCommission,
          platformCommissionRate: order.totalPrice > 0 ? 
            ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + '%' : 
            '0%',
        });
      }
      
      filteredSummaries = filteredResults;
      totalAdminCommission = filteredAdminCommission;
      totalVendorCommission = filteredVendorCommission;
      totalRevenue = filteredRevenue;
    }

    res.json({
      success: true,
      summary: {
        totalOrders: filteredSummaries.length,
        totalRevenue: totalRevenue,
        totalAdminCommission: totalAdminCommission,
        totalVendorCommission: totalVendorCommission,
        platformCommissionRate: totalRevenue > 0 ? 
          ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + '%' : 
          '0%',
      },
      orders: filteredSummaries,
    });
  } catch (err) {
    console.error("Admin commissions fetch error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: err.message 
    });
  }
});

// ============================================
// ADMIN: UPDATE ORDER STATUS
// ============================================
router.put("/admin/status/:orderId", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
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