// Router/orderRouter.js - COMPLETE UPDATED WITH VARIANT, CUSTOM FIELD & PAYU (FIXED HASH)
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Vendor = require("../Models/Vendor");
const SellerDocument = require("../Models/SellerDocument");
const Product = require("../Models/Product");
const Coupon = require("../Models/Coupon");
const axios = require("axios");
const {
  sendEmail,
  getCustomerOrderEmail,
  getAdminOrderEmail,
  getVendorOrderEmail,
  emailMode,
} = require("../Comfig/emailConfig");

const shiprocketService = require("../utils/shiprocketService");

const VENDOR_API_URL =
  process.env.VENDOR_API_URL ||
  "https://api.brandelvendor.starlighttechlabsindia.com/api";

// ============================================
// 🆕 PAYU HELPER FUNCTIONS (FIXED)
const generatePayUHash = (data) => {
  const { key, txnid, amount, productinfo, firstname, email, salt } = data;
  
  // ✅ CORRECTED FORMULA based on PayU Error Message:
  // PayU expects 11 pipes (|||||||||||) after email before SALT
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  
  console.log("🔑 PayU Hash String:", hashString);
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

const verifyPayUHash = (data) => {
  const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;
  
  let hashString;
  if (additionalCharges) {
    // If additional charges are present
    hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    // Standard reverse hash: salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }
  
  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  console.log("🔐 Reverse Hash Calculated:", calculatedHash);
  console.log("🔐 Reverse Hash Received  :", hash);
  return calculatedHash === hash;
};

// ============================================
// ✅ HELPER: Get complete vendor data from SellerDocument
// ============================================
async function getCompleteVendorData(vendorId) {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return null;

    const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

    const vendorData = {
      _id: vendor._id,
      name: vendor.name || vendor.company,
      company: vendor.company || "N/A",
      email: vendor.email,
      phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
      address: sellerDoc?.contact?.address || "Default Address",
      city: sellerDoc?.contact?.city || "Mumbai",
      state: sellerDoc?.contact?.state || "Maharashtra",
      pincode: sellerDoc?.contact?.pincode || "400001",
      country: sellerDoc?.contact?.country || "India",
    };

    return vendorData;
  } catch (error) {
    console.error("Error fetching vendor data:", error.message);
    return null;
  }
}

// ============================================
// PLACE ORDER
// ============================================
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Incomplete data",
    });
  }

  try {
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const itemsWithVendorInfo = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId).populate({
          path: "vendorId",
          select: "company name email _id",
        });

        let company = null;
        let vendorId = null;

        if (product?.vendorId) {
          if (product.vendorId._id) {
            vendorId = product.vendorId._id;
          } else if (
            typeof product.vendorId === "string" ||
            product.vendorId instanceof mongoose.Types.ObjectId
          ) {
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
            company: { $regex: new RegExp(`^${item.company}$`, "i") },
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

        const variantImage = item.variantImage || null;
        const variantPrice = item.variantPrice || 0;
        const customFieldLabel = item.customFieldLabel || null;
        const customFieldValue = item.customFieldValue || null;

        return {
          productId: item.productId,
          name: item.name || product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          stock: product?.stock || 0,
          image: variantImage
            ? variantImage
            : Array.isArray(item.image)
            ? item.image[0]
            : item.image || product?.image?.[0] || null,
          vendorId: vendorId,
          company: company || "N/A",
          weight: product?.weight || 0.5,
          variantId: item.variantId || null,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          variantPrice: variantPrice,
          customFieldLabel: customFieldLabel,
          customFieldValue: customFieldValue,
        };
      })
    );

    for (const item of itemsWithVendorInfo) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      if (item.variantId && product.variants && product.variants.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `Variant not found for ${product.name}`,
          });
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (${variant.color} ${variant.size}). Available: ${variant.stock}`,
          });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          });
        }
      }
    }

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

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase(),
          isActive: true,
        });

        if (coupon) {
          const isExpired =
            coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          const usageLimitReached =
            coupon.usageLimit &&
            (coupon.usageCount || 0) >= coupon.usageLimit;
          const minOrderNotMet =
            coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

          if (!isExpired && !usageLimitReached && !minOrderNotMet) {
            let discountAmount = 0;

            if (coupon.discountType === "percentage") {
              discountAmount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(
                  discountAmount,
                  coupon.maxDiscountAmount
                );
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

            coupon.usageCount = (coupon.usageCount || 0) + 1;
            await coupon.save();
          }
        }
      } catch (couponError) {
        console.error("Coupon validation error:", couponError);
      }
    }

    const isOnlinePayment = paymentMethod === "PayU" || paymentMethod === "Online" || paymentMethod === "upi" || paymentMethod === "card";
    
    const order = new Order({
      guestId,
      items: itemsWithVendorInfo.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        stockAtPurchase: item.stock,
        image: item.image ? [item.image] : [],
        vendorId: item.vendorId,
        company: item.company,
        weight: item.weight || 0.5,
        variantId: item.variantId || null,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        variantImage: item.variantImage || "",
        variantPrice: item.variantPrice || 0,
        customFieldLabel: item.customFieldLabel || null,
        customFieldValue: item.customFieldValue || null,
      })),
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",
      subtotal: subtotal,
      totalPrice: totalPrice,
      coupon: couponData,
      orderStatus: "Pending", 
    });

    await order.save();

    for (const item of itemsWithVendorInfo) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.productId, "variants._id": item.variantId },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    await Cart.findOneAndDelete({ guestId });

    const orderId = order._id;

    // SHIPROCKET INTEGRATION
    let shipmentResults = [];
    let shiprocketSyncStatus = "pending";

    try {
      if (process.env.SHIPROCKET_ENABLED === "true") {
        const vendorItemsMap = {};

        for (const item of itemsWithVendorInfo) {
          if (item.vendorId) {
            const vendorId = item.vendorId.toString();
            if (!vendorItemsMap[vendorId]) {
              vendorItemsMap[vendorId] = [];
            }
            vendorItemsMap[vendorId].push({
              ...item,
              weight: item.weight || 0.5,
            });
          }
        }

        const vendorIds = Object.keys(vendorItemsMap);

        if (vendorIds.length > 0) {
          for (const vendorId of vendorIds) {
            try {
              const vendorData = await getCompleteVendorData(vendorId);
              if (!vendorData) {
                shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
                continue;
              }

              const vendorItems = vendorItemsMap[vendorId];
              const result = await shiprocketService.createVendorShipment(
                order,
                vendorData,
                vendorItems,
                shippingAddress
              );
              shipmentResults.push(result);
            } catch (vendorError) {
              shipmentResults.push({ vendorId, success: false, error: vendorError.message });
            }
          }

          const successfulShipments = shipmentResults.filter((r) => r.success);
          order.shipments = successfulShipments.map((r) => ({
            vendorId: r.vendorId,
            company: r.company,
            shipmentId: r.shipmentId,
            orderId: r.orderId,
            awbCode: r.awbCode,
            labelUrl: r.labelUrl,
            status: "created",
            createdAt: new Date(),
          }));

          if (successfulShipments.length === shipmentResults.length) {
            shiprocketSyncStatus = "synced";
          } else if (successfulShipments.length > 0) {
            shiprocketSyncStatus = "partial";
          } else {
            shiprocketSyncStatus = "failed";
          }

          order.shiprocketSyncStatus = shiprocketSyncStatus;
          await order.save();
        } else {
          order.shiprocketSyncStatus = "skipped";
          await order.save();
        }
      } else {
        order.shiprocketSyncStatus = "disabled";
        await order.save();
      }
    } catch (shiprocketError) {
      order.shiprocketSyncStatus = "failed";
      order.shiprocketError = shiprocketError.message;
      await order.save();
    }

    // EMAIL RESULTS
    const emailResults = { customer: false, admin: false, vendors: [] };

    const customerEmail = shippingAddress.email;
    if (customerEmail && !isOnlinePayment) {
      try {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
        emailResults.customer = result.success;
      } catch (error) {
        console.error("Error sending customer email:", error.message);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
    if (adminEmail) {
      try {
        const adminHtml = getAdminOrderEmail(order, orderId);
        const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
        emailResults.admin = result.success;
      } catch (error) {
        console.error("Error sending admin email:", error.message);
      }
    }

    const vendorGroups = new Map();
    for (const item of itemsWithVendorInfo) {
      if (item.company && item.company !== "N/A") {
        const company = item.company;
        if (!vendorGroups.has(company)) {
          vendorGroups.set(company, { company: company, items: [], vendorId: item.vendorId });
        }
        vendorGroups.get(company).items.push(item);
      }
    }

    for (const [company, vendorData] of vendorGroups) {
      try {
        let vendor = await Vendor.findOne({ company: company }).select("email name company phone");
        if (!vendor) {
          vendor = await Vendor.findOne({ company: { $regex: new RegExp(`^${company}$`, "i") } }).select("email name company phone");
        }

        if (vendor && vendor.email) {
          const vendorItems = vendorData.items;
          const vendorHtml = getVendorOrderEmail(order, orderId, vendorItems, {
            name: vendor.name || company,
            email: vendor.email,
            shopName: company,
            phone: vendor?.phone || "N/A",
          });

          const result = await sendEmail(vendor.email, `New Order Received for ${company} - Order #${orderId}`, vendorHtml);
          emailResults.vendors.push({ company: company, email: vendor.email, success: result.success });
        }
      } catch (vendorErr) {
        console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
      }
    }

    const notificationResults = [];
    for (const [company, vendorData] of vendorGroups) {
      try {
        const vendorItems = vendorData.items;
        const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

        const notificationData = {
          company: company,
          title: "🛒 New Order Received!",
          message: `You have received a new order #${orderId.toString().slice(-6)}.\n\nTotal Amount: ₹${vendorTotal}\nItems: ${vendorItems.length} product(s)\nCustomer: ${shippingAddress?.name || "Customer"}\nPhone: ${shippingAddress?.phone || "N/A"}\nOrder Date: ${new Date().toLocaleString()}\n\nPlease check and process the order.`,
          read: false,
          orderId: orderId,
        };

        await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        });
        notificationResults.push({ company, success: true });
      } catch (vendorError) {
        notificationResults.push({ company, success: false, error: vendorError.message });
      }
    }

    // ============================================
    // 🆕 GENERATE PAYU PARAMS IF ONLINE PAYMENT
    // ============================================
    let payuParams = null;
    if (isOnlinePayment) {
      const txnid = `TXN_${Date.now()}_${order._id}`;
      
      order.payuTxnId = txnid;
      await order.save();

      // ✅ Ensure amount is a clean 2-decimal string
      const cleanAmount = Number(order.totalPrice).toFixed(2);

      const hashData = {
        key: process.env.PAYU_KEY,
        txnid: txnid,
        amount: cleanAmount,
        productinfo: "Order Payment",
        firstname: shippingAddress.name,
        email: shippingAddress.email,
        salt: process.env.PAYU_SALT
      };

      const hash = generatePayUHash(hashData);

      payuParams = {
        key: process.env.PAYU_KEY,
        txnid: txnid,
        amount: cleanAmount,
        productinfo: "Order Payment",
        firstname: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        surl: `${process.env.BACKEND_URL}/api/order/payu/success`,
        furl: `${process.env.BACKEND_URL}/api/order/payu/failure`,
        hash: hash,
        service_provider: "payu_paisa"
      };
    }

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
      payuParams: payuParams,
      shipments: shipmentResults,
      shiprocketSyncStatus: shiprocketSyncStatus,
      emailResults: emailResults,
      notificationResults: notificationResults,
      vendorCount: vendorGroups.size,
      emailMode: emailMode,
    });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

// ============================================
// 🆕 PAYU SUCCESS CALLBACK
// ============================================
router.post("/payu/success", async (req, res) => {
  try {
    const responseData = req.body;
    
    const isValid = verifyPayUHash({
      ...responseData,
      salt: process.env.PAYU_SALT,
      key: process.env.PAYU_KEY
    });

    if (!isValid) {
      console.error("❌ PayU Hash verification failed");
      return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
    }

    // Extract Order ID from txnid: TXN_timestamp_orderId
    const orderId = responseData.txnid.split('_')[2];

    const order = await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid",
      payuPaymentId: responseData.mihpayid,
      orderStatus: "Processing"
    }, { new: true });

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
    }

    // Send Customer Email after successful payment
    try {
      const customerEmail = order.shippingAddress.email;
      if (customerEmail) {
        const customerHtml = getCustomerOrderEmail(order, orderId);
        await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
      }
    } catch (emailErr) {
      console.error("Error sending post-payment email:", emailErr);
    }

    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=success&orderId=${orderId}`);
  } catch (error) {
    console.error("PayU Success Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
  }
});

// ============================================
// 🆕 PAYU FAILURE CALLBACK
// ============================================
router.post("/payu/failure", async (req, res) => {
  try {
    const responseData = req.body;
    const orderId = responseData.txnid ? responseData.txnid.split('_')[2] : null;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Failed",
        orderStatus: "Cancelled"
      });
    }

    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
  } catch (error) {
    console.error("PayU Failure Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
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
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    let totalAdminCommission = 0;
    let totalVendorCommission = 0;
    const vendorBreakdown = {};

    for (const item of order.items) {
      if (item.vendorId) {
        const vendorIdStr = item.vendorId.toString();
        const vendor = await Vendor.findById(item.vendorId).populate("planId");

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
            company: item.company || "Unknown",
            vendorId: item.vendorId,
            vendorName: vendor?.name || "Unknown",
            vendorEmail: vendor?.email || "N/A",
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
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          customFieldLabel: item.customFieldLabel || null,
          customFieldValue: item.customFieldValue || null,
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
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal || order.totalPrice,
      totalPrice: order.totalPrice,
      coupon: order.coupon || null,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      shipments: order.shipments || [],
      shiprocketSyncStatus: order.shiprocketSyncStatus,
      shiprocketError: order.shiprocketError || null,
      commissionSummary: {
        totalAdminCommission: totalAdminCommission,
        totalVendorCommission: totalVendorCommission,
        platformCommissionRate: order.totalPrice > 0 ? ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + "%" : "0%",
        vendorCommissionRate: order.totalPrice > 0 ? ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + "%" : "0%",
      },
      vendorBreakdown: Object.values(vendorBreakdown),
    });
  } catch (err) {
    console.error("Commission view error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
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
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
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
          const vendor = await Vendor.findById(item.vendorId).populate("planId");
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
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        vendorCount: vendorSet.size,
        shipmentCount: order.shipments?.length || 0,
        shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
        adminCommission: orderAdminCommission,
        vendorCommission: orderVendorCommission,
        platformCommissionRate: order.totalPrice > 0 ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%" : "0%",
      });
    }

    let filteredSummaries = orderSummaries;
    if (vendorId) {
      const filteredOrders = await Order.find({ ...filter, "items.vendorId": vendorId }).sort({ createdAt: -1 });
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
            const vendor = await Vendor.findById(item.vendorId).populate("planId");
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
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          vendorCount: vendorSet.size,
          shipmentCount: order.shipments?.length || 0,
          shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
          adminCommission: orderAdminCommission,
          vendorCommission: orderVendorCommission,
          platformCommissionRate: order.totalPrice > 0 ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%" : "0%",
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
        platformCommissionRate: totalRevenue > 0 ? ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + "%" : "0%",
      },
      orders: filteredSummaries,
    });
  } catch (err) {
    console.error("Admin commissions fetch error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
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
      return res.status(400).json({ success: false, message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled" });
    }

    const order = await Order.findByIdAndUpdate(req.params.orderId, { orderStatus: status }, { new: true });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: {
        _id: order._id,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
        shipments: order.shipments || [],
        shiprocketSyncStatus: order.shiprocketSyncStatus,
      },
    });
  } catch (err) {
    console.error("Order status update error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ============================================
// SEND ORDER CONFIRMATION EMAIL (Manual Trigger)
// ============================================
router.post("/send-confirmation", async (req, res) => {
  try {
    const { to, subject, orderId, customerName, items, subtotal, couponDiscount, shippingCost, total, shippingAddress, paymentMethod, shippingMethod, orderDate } = req.body;

    if (!to) return res.status(400).json({ success: false, message: "Recipient email is required" });

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; }
          .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { color: #fff; margin: 0; }
          .order-details { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #28a745; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
        </style></head>
      <body>
        <div class="container">
          <div class="header"><h1>🎉 Order Confirmed!</h1><p>Thank you, ${customerName || "Customer"}!</p></div>
          <div style="padding: 20px;">
            <div class="order-details">
              <p><strong>📋 Order #:</strong> ${orderId}</p>
              <p><strong>📅 Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
              <p><strong>💳 Payment:</strong> ${paymentMethod || "COD"}</p>
            </div>
            <h3>🛍️ Order Items</h3>
            <table class="items-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>${(items || []).map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("")}</tbody></table>
            <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
              <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>₹${(subtotal || 0).toFixed(2)}</span></div>
              ${couponDiscount > 0 ? `<div style="display:flex; justify-content:space-between; color:#28a745;"><span>Discount</span><span>-₹${(couponDiscount || 0).toFixed(2)}</span></div>` : ""}
              <div style="display:flex; justify-content:space-between;"><span>Shipping</span><span>${shippingCost === 0 ? "FREE" : `₹${(shippingCost || 0).toFixed(2)}`}</span></div>
              <div style="display:flex; justify-content:space-between; font-size:20px; font-weight:bold; border-top:2px solid #28a745;"><span>Total</span><span style="color:#28a745;">₹${(total || 0).toFixed(2)}</span></div>
            </div>
            <div class="footer"><p>Thank you for shopping with us! 🛍️</p></div>
          </div>
        </div>
      </body></html>`;

    const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);
    if (result.success) {
      res.json({ success: true, message: "Email sent successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
    }
  } catch (err) {
    console.error("Send confirmation error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;