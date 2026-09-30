const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Order = require("../Models/Order");
const Cart = require("../Models/Cart");
const Vendor = require("../Models/Vendor");
const SellerDocument = require("../Models/SellerDocument");
const Product = require("../Models/Product");
const Coupon = require("../Models/Coupon");
const axios = require("axios");

// ✅ Direct require to avoid destructuring issues
const emailConfig = require("../Comfig/emailConfig");
const sendEmail = emailConfig.sendEmail;
const getCustomerOrderEmail = emailConfig.getCustomerOrderEmail;
const getAdminOrderEmail = emailConfig.getAdminOrderEmail;
const getVendorOrderEmail = emailConfig.getVendorOrderEmail;
const emailMode = emailConfig.emailMode;

const shiprocketService = require("../utils/shiprocketService");

const VENDOR_API_URL =
  process.env.VENDOR_API_URL ||
  "https://api.brandelvendor.starlighttechlabsindia.com/api";

// ============================================
// HELPER: Order visibility filter
// ============================================
const getVisibleOrdersFilter = (extraFilter = {}) => {
  return {
    ...extraFilter,
    orderStatus: { $nin: ["Cancelled", "PENDING_PAYMENT"] },
    $and: [
      {
        $or: [
          { "shippingAddress.email": { $ne: "pending@fastrr-checkout.com" } },
          { "shippingAddress.email": { $exists: false } },
        ],
      },
      {
        $or: [
          {
            paymentMethod: {
              $in: [
                "COD",
                "cod",
                "Cod",
                "Cash on Delivery",
                "cash on delivery",
                "cash_on_delivery",
              ],
            },
          },
          { paymentStatus: "Paid" },
        ],
      },
    ],
  };
};

// ============================================
// HELPER: Detect placeholder addresses
// ============================================
const isPlaceholderAddress = (addr) => {
  if (!addr) return true;
  const a = String(addr.address || "").toLowerCase();
  const e = String(addr.email || "").toLowerCase();
  const p = String(addr.phone || "");
  return (
    !a ||
    a.includes("pending") ||
    a.includes("will be provided") ||
    a.includes("will be captured") ||
    e === "pending@fastrr-checkout.com" ||
    e === "guest@native91.com" ||
    p === "0000000000" ||
    p === "9999999999"
  );
};

// ============================================
// PAYU HELPER FUNCTIONS
// ============================================
const generatePayUHash = (data) => {
  const { key, txnid, amount, productinfo, firstname, email, salt } = data;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

const verifyPayUHash = (data) => {
  const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

  let hashString;
  if (additionalCharges) {
    hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  } else {
    hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  }

  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
  return calculatedHash === hash;
};

// ============================================
// HELPER: Get complete vendor data
// ============================================
async function getCompleteVendorData(vendorId) {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return null;

    const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

    return {
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
  } catch (error) {
    console.error("Error fetching vendor data:", error.message);
    return null;
  }
}

// ============================================
// HELPER: Normalize string
// ============================================
const normalizeString = (s) =>
  (s || "").toString().trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");

// ============================================
// HELPER: Push order to Shiprocket Logistics (with AWB)
// ============================================
async function pushOrderToShiprocket(order) {
  try {
    if (process.env.SHIPROCKET_ENABLED !== "true") {
      console.log("ℹ️ Shiprocket disabled — skipping push");
      order.shiprocketSyncStatus = "disabled";
      await order.save();
      return;
    }

    console.log(`🚀 Pushing order ${order._id} to Shiprocket Logistics...`);
    console.log(`💰 Order Total: ₹${order.totalPrice}, COD Charges: ₹${order.codCharges || 0}`);

    // Group items by vendor
    const vendorItemsMap = {};
    for (const item of order.items) {
      const vid = item.vendorId?.toString();
      if (!vid) continue;
      if (!vendorItemsMap[vid]) vendorItemsMap[vid] = [];
      vendorItemsMap[vid].push(item);
    }

    const vendorIds = Object.keys(vendorItemsMap);

    if (vendorIds.length === 0) {
      console.warn("⚠️ No vendor IDs found — skipping Shiprocket push");
      order.shiprocketSyncStatus = "skipped";
      order.shiprocketError = "No vendor IDs found in items";
      await order.save();
      return;
    }

    const shipmentResults = [];

    for (const vendorId of vendorIds) {
      try {
        const vendorData = await getCompleteVendorData(vendorId);
        if (!vendorData) {
          shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
          continue;
        }

        const vendorItems = vendorItemsMap[vendorId];

        // ✅ Pass COD charges to Shiprocket
        const result = await shiprocketService.createVendorShipment(
          order,
          vendorData,
          vendorItems,
          order.shippingAddress
        );

        shipmentResults.push(result);

        if (result.success) {
          console.log(`✅ Shipment created for ${vendorData.company}: ${result.shipmentId}`);
        } else {
          console.error(`❌ Shipment failed for ${vendorData.company}: ${result.error}`);
        }
      } catch (vendorErr) {
        console.error(`❌ Vendor shipment error (${vendorId}):`, vendorErr.message);
        shipmentResults.push({ vendorId, success: false, error: vendorErr.message });
      }
    }

    const successfulShipments = shipmentResults.filter((r) => r.success);

    const shipmentsWithAWB = [];
    for (const r of successfulShipments) {
      let awbCode = r.awbCode || "UNKNOWN";
      let labelUrl = r.labelUrl || "";

      if (r.shipmentId && r.shipmentId !== "UNKNOWN" && awbCode === "UNKNOWN") {
        try {
          console.log(`🚚 Assigning AWB for shipment: ${r.shipmentId}`);
          const awbResult = await shiprocketService.assignAWB(r.shipmentId);

          if (awbResult.success) {
            awbCode = awbResult.awbCode || "UNKNOWN";
            console.log(`✅ AWB assigned: ${awbCode}`);

            try {
              const labelResult = await shiprocketService.generateLabel(r.shipmentId);
              if (labelResult.success) {
                labelUrl = labelResult.labelUrl || "";
                console.log(`✅ Label generated`);
              }
            } catch (labelErr) {
              console.warn(`⚠️ Label generation failed: ${labelErr.message}`);
            }
          }
        } catch (awbErr) {
          console.error(`❌ AWB assign error: ${awbErr.message}`);
        }
      }

      shipmentsWithAWB.push({
        vendorId: r.vendorId,
        company: r.company,
        shipmentId: r.shipmentId,
        orderId: r.orderId,
        awbCode: awbCode,
        labelUrl: labelUrl,
        status: "created",
        createdAt: new Date(),
      });
    }

    order.shipments = shipmentsWithAWB;

    if (successfulShipments.length === shipmentResults.length) {
      order.shiprocketSyncStatus = "synced";
    } else if (successfulShipments.length > 0) {
      order.shiprocketSyncStatus = "partial";
    } else {
      order.shiprocketSyncStatus = "failed";
    }

    await order.save();

    console.log(`📦 Shiprocket sync: ${successfulShipments.length}/${shipmentResults.length} — status: ${order.shiprocketSyncStatus}`);
  } catch (err) {
    console.error("❌ Shiprocket push error:", err.message);
    order.shiprocketSyncStatus = "failed";
    order.shiprocketError = err.message;
    await order.save();
  }
}

// ============================================
// FASTrr CHECKOUT — CREATE ORDER (PENDING_PAYMENT)
// ============================================
router.post("/shiprocket-checkout", async (req, res) => {
  try {
    const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

    if (!guestId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid cart" });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
      return res.status(400).json({ success: false, message: "Shipping address required" });
    }

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

    let apiProducts = [];
    try {
      const apiRes = await axios.get(`${BASE_URL}/api/v2/products?page=1&limit=500`, { timeout: 10000 });
      apiProducts = apiRes.data?.data?.products || [];
      console.log(`📦 Fetched ${apiProducts.length} Fastrr products`);
    } catch (apiErr) {
      console.error("❌ Failed to fetch Fastrr catalog:", apiErr.message);
      return res.status(500).json({
        success: false,
        code: "FASTRR_CATALOG_UNAVAILABLE",
        message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
      });
    }

    const itemsWithVendorInfo = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId).populate({ path: "vendorId", select: "company name email _id" });

      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      let effectiveStock = product.stock || 0;
      let variantIdx = 0;
      let variantDoc = null;

      if (item.variantId && product.variants && product.variants.length > 0) {
        variantDoc = product.variants.id(item.variantId);
        if (!variantDoc) {
          return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
        }
        effectiveStock = variantDoc.stock || 0;
        variantIdx = product.variants.findIndex(
          (v) => v._id && v._id.toString() === item.variantId.toString()
        );
        if (variantIdx < 0) variantIdx = 0;
      }

      if (effectiveStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
        });
      }

      let vendorId = null;
      if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
      else if (product.vendorId) vendorId = product.vendorId;
      else if (product.vendor) vendorId = product.vendor;

      const productName = (product.name || product.ProductName || "").trim();

      let matchedApiProduct = apiProducts.find((p) => {
        const apiTitle = (p.title || "").trim().toLowerCase();
        return apiTitle === productName.toLowerCase();
      });

      if (!matchedApiProduct) {
        const normalizedDbName = normalizeString(productName);
        matchedApiProduct = apiProducts.find((p) => normalizeString(p.title) === normalizedDbName);
      }

      if (!matchedApiProduct) {
        return res.status(400).json({
          success: false,
          code: "FASTRR_CATALOG_MISSING",
          message: `"${productName}" is not yet available for Fastrr checkout. Please use standard checkout.`,
          productName,
          productId: item.productId,
        });
      }

      let shiprocketVariantId = null;

      if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
        if (variantDoc) {
          const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();
          const matchedApiVariant = matchedApiProduct.variants.find((av) => {
            const apiVariantTitle = (av.title || "").trim().toLowerCase();
            return apiVariantTitle === variantTitle;
          });

          if (matchedApiVariant) {
            shiprocketVariantId = matchedApiVariant.id;
          } else {
            shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
              || matchedApiProduct.variants[0]?.id
              || null;
          }
        } else {
          shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
        }
      }

      if (!shiprocketVariantId) {
        return res.status(400).json({
          success: false,
          code: "FASTRR_VARIANT_MISSING",
          message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
        });
      }

      itemsWithVendorInfo.push({
        productId: item.productId,
        variantId: item.variantId || null,
        shiprocketVariantId,
        name: item.name || product.name,
        price: item.price || product.price,
        quantity: item.quantity,
        stock: effectiveStock,
        image: Array.isArray(item.image) ? item.image : [item.image],
        vendorId,
        company: product.company || product.vendorId?.company || "N/A",
        weight: product.weight || 0.5,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        variantImage: item.variantImage || "",
        variantPrice: item.variantPrice || 0,
        customFieldLabel: item.customFieldLabel || null,
        customFieldValue: item.customFieldValue || null,
        sku: item.sku || "",
      });
    }

    const order = new Order({
      guestId,
      items: itemsWithVendorInfo,
      shippingAddress,
      paymentMethod: "Shiprocket",
      paymentStatus: "Pending",
      subtotal,
      totalPrice: total,
      orderStatus: "PENDING_PAYMENT",
      coupon: couponCode
        ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
        : { code: null, discountAmount: 0 },
    });

    await order.save();

    const accessTokenPayload = {
      cart_data: {
        items: itemsWithVendorInfo.map((i) => ({
          variant_id: String(i.shiprocketVariantId),
          quantity: Number(i.quantity),
        })),
      },
      redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`,
      timestamp: new Date().toISOString(),
    };

    const payloadString = JSON.stringify(accessTokenPayload);
    const hmac = crypto
      .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
      .update(payloadString)
      .digest("base64");

    console.log("🔑 Fastrr Access Token Request");

    let accessToken = null;
    let shiprocketOrderId = null;

    try {
      const tokenResponse = await axios.post(
        "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
        payloadString,
        {
          headers: {
            "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
            "X-Api-HMAC-SHA256": hmac,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
      shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
        || tokenResponse.data?.result?.order_id
        || tokenResponse.data?.order_id
        || null;

      const fastrrCartId =
        tokenResponse.data?.result?.data?.cart_id ||
        tokenResponse.data?.result?.cart_id ||
        tokenResponse.data?.cart_id ||
        null;

      console.log(`🔍 Extracted: orderId=${shiprocketOrderId}, cartId=${fastrrCartId}`);

      if (shiprocketOrderId) {
        order.shiprocketOrderId = shiprocketOrderId;
        if (fastrrCartId) order.fastrrCartId = fastrrCartId;
        await order.save();
      }
    } catch (tokenErr) {
      console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to generate checkout token",
        error: tokenErr.response?.data || tokenErr.message,
      });
    }

    if (!accessToken) {
      return res.status(500).json({
        success: false,
        message: "No access token received from Fastrr",
      });
    }

    res.json({
      success: true,
      orderId: order._id,
      accessToken,
      shiprocketOrderId,
      fastrrCartId: order.fastrrCartId,
    });
  } catch (err) {
    console.error("Shiprocket checkout create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// FASTrr CHECKOUT — ORDER WEBHOOK
// ✅ FIX: COD charges extract + totalPrice update
// ============================================
router.post("/shiprocket-webhook", async (req, res) => {
  try {
    console.log("📩 Fastrr Webhook received:", JSON.stringify(req.body, null, 2));

    const {
      cart_id,
      latest_stage,
      email,
      phone_number,
      total_price,
      total_amount_payable,
      shipping_address,
      paymentDetails,
      order_id,
      payment_method,
      payment_type,
      is_cod,
    } = req.body;

    // ============================================================
    // ✅ FIX: Extract COD charges from multiple sources
    // ============================================================
    const codCharges = Number(
      paymentDetails?.codCharges ||
      paymentDetails?.cod_charges ||
      req.body.codCharges ||
      req.body.cod_charges ||
      0
    );

    const finalTotalPrice = Number(
      total_amount_payable ||
      total_price ||
      order?.totalPrice ||
      0
    );

    console.log(`💰 Webhook amounts → total_price: ${total_price}, total_amount_payable: ${total_amount_payable}, codCharges: ${codCharges}`);

    const rawPaymentMode = String(
      paymentDetails?.paymentMode || payment_method || payment_type || ""
    ).toLowerCase().trim();

    const isCOD =
      is_cod === true ||
      is_cod === "true" ||
      rawPaymentMode === "cod" ||
      rawPaymentMode === "cash on delivery" ||
      rawPaymentMode === "cash_on_delivery";

    const isPaid =
      latest_stage === "ORDER_PLACED" &&
      !isCOD &&
      (paymentDetails?.transactionId ||
        ["upi", "card", "netbanking", "wallet", "prepaid"].includes(rawPaymentMode));

    const assumeCOD =
      latest_stage === "ORDER_PLACED" && !isPaid && !rawPaymentMode;

    console.log(`💳 Payment detection → mode: "${rawPaymentMode}", stage: "${latest_stage}", isCOD: ${isCOD}, isPaid: ${isPaid}, assumeCOD: ${assumeCOD}`);

    // ============================================================
    // 4-STEP ORDER MATCHING
    // ============================================================
    let order = null;
    let matchSource = null;

    if (cart_id) {
      order = await Order.findOne({ fastrrCartId: cart_id });
      if (order) matchSource = "fastrrCartId";
    }

    if (!order && order_id) {
      order = await Order.findOne({ shiprocketOrderId: order_id });
      if (order) matchSource = "shiprocketOrderId";
    }

    if (!order && (email || phone_number)) {
      const orConditions = [];
      if (email) orConditions.push({ "shippingAddress.email": email });
      if (phone_number) orConditions.push({ "shippingAddress.phone": phone_number });

      order = await Order.findOne({
        paymentMethod: "Shiprocket",
        orderStatus: "PENDING_PAYMENT",
        $and: [
          { $or: [{ fastrrCartId: null }, { fastrrCartId: { $exists: false } }] },
          { $or: orConditions },
        ],
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      }).sort({ createdAt: -1 });
      if (order) matchSource = "email/phone";
    }

    if (!order) {
      order = await Order.findOne({
        paymentMethod: "Shiprocket",
        orderStatus: "PENDING_PAYMENT",
        $or: [{ fastrrCartId: null }, { fastrrCartId: { $exists: false } }],
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
      }).sort({ createdAt: -1 });
      if (order) matchSource = "recent-fallback";
    }

    if (!order) {
      console.warn("⚠️ No matching order found. cart_id:", cart_id);
      return res.json({ success: true, message: "Order not found" });
    }

    console.log(`✅ Order matched via ${matchSource}: ${order._id}`);

    if (cart_id && !order.fastrrCartId) {
      order.fastrrCartId = cart_id;
    }

    if (order.orderStatus === "Cancelled") {
      await order.save();
      return res.json({ success: true, message: "Order cancelled" });
    }

    const buildAddressFromFastrr = (addr, fallbackEmail, fallbackPhone) => {
      if (!addr) return null;
      const fullName = `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || addr.name || "Customer";
      return {
        name: fullName,
        email: fallbackEmail && fallbackEmail !== "pending@fastrr-checkout.com"
          ? fallbackEmail
          : (order.shippingAddress?.email && order.shippingAddress.email !== "pending@fastrr-checkout.com"
            ? order.shippingAddress.email
            : fallbackEmail || "customer@native91.com"),
        phone: addr.phone || fallbackPhone || order.shippingAddress?.phone || "",
        address: [addr.address1, addr.address2].filter(Boolean).join(", ") || "Address not provided",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.zip || addr.pincode || "",
        country: addr.country || "India",
      };
    };

    const realShippingAddress = buildAddressFromFastrr(shipping_address, email, phone_number);

    // ============================================================
    // CASE 1: ORDER PLACED
    // ============================================================
    if (latest_stage === "ORDER_PLACED") {
      console.log(`🟢 ORDER_PLACED detected`);

      // ✅ COD / Paid detection
      if (isCOD || assumeCOD) {
        order.paymentMethod = "COD";
        order.paymentStatus = "Pending";
        console.log(`✅ Set as COD`);
      } else if (isPaid) {
        order.paymentMethod = rawPaymentMode
          ? rawPaymentMode.charAt(0).toUpperCase() + rawPaymentMode.slice(1)
          : "Prepaid";
        order.paymentStatus = "Paid";
        if (paymentDetails?.transactionId) {
          order.shiprocketPaymentId = String(paymentDetails.transactionId);
        }
        console.log(`✅ Set as Paid (${order.paymentMethod})`);
      } else {
        order.paymentMethod = "COD";
        order.paymentStatus = "Pending";
        console.log(`⚠️ Defaulting to COD`);
      }

      order.orderStatus = "Processing";

      // ============================================================
      // ✅ FIX: Total price with COD charges
      // ============================================================
      // Fastrr sends final total in `total_price` OR `total_amount_payable`
      // If total_price includes COD charges → use it directly
      // If codCharges are separate → add them

      if (finalTotalPrice > 0) {
        order.totalPrice = finalTotalPrice;
        console.log(`✅ Total price set: ₹${order.totalPrice}`);
      }

      // ✅ Store COD charges separately for records
      if (codCharges > 0) {
        order.codCharges = codCharges;
        console.log(`✅ COD charges stored: ₹${codCharges}`);
      }

      if (realShippingAddress) {
        order.shippingAddress = realShippingAddress;
        console.log(`✅ Real address updated`);
      }

      order.statusUpdatedAt = new Date();
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Processing",
        updatedAt: new Date(),
        updatedBy: null,
        note: isCOD || assumeCOD
          ? `COD order confirmed via Fastrr webhook (Total: ₹${order.totalPrice}${codCharges > 0 ? `, COD charges: ₹${codCharges}` : ''})`
          : `Paid via ${order.paymentMethod} (Fastrr webhook)`,
      });

      await order.save();

      for (const item of order.items) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }

      await Cart.findOneAndDelete({ guestId: order.guestId });

      // ✅ PUSH TO SHIPROCKET (with updated totalPrice + codCharges)
      await pushOrderToShiprocket(order);

      try {
        const customerEmail = order.shippingAddress?.email;
        if (customerEmail && typeof getCustomerOrderEmail === "function") {
          const html = getCustomerOrderEmail(order, order._id);
          await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
        }
      } catch (emailErr) {
        console.error("Customer email error:", emailErr.message);
      }

      try {
        const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
        if (adminEmail && typeof getAdminOrderEmail === "function") {
          const adminHtml = getAdminOrderEmail(order, order._id);
          await sendEmail(adminEmail, `New Order - #${order._id}`, adminHtml);
        }
      } catch (emailErr) {
        console.error("Admin email error:", emailErr.message);
      }

      return res.json({
        success: true,
        orderId: order._id,
        type: "ORDER_PLACED",
        totalPrice: order.totalPrice,
        codCharges: order.codCharges || 0,
        shiprocketSyncStatus: order.shiprocketSyncStatus,
      });
    }

    // ============================================================
    // CASE 2: PAYMENT_INITIATED
    // ============================================================
    if (latest_stage === "PAYMENT_INITIATED") {
      console.log(`🟡 PAYMENT_INITIATED — saving address`);

      if (realShippingAddress) {
        order.shippingAddress = realShippingAddress;
      }

      if (cart_id) order.fastrrCartId = cart_id;
      await order.save();

      return res.json({ success: true, orderId: order._id, type: "PAYMENT_INITIATED" });
    }

    // ============================================================
    // CASE 3: INIT
    // ============================================================
    if (latest_stage === "INIT") {
      console.log(`🔵 INIT — saving fastrrCartId`);

      if (cart_id) order.fastrrCartId = cart_id;
      await order.save();

      return res.json({ success: true, orderId: order._id, type: "INIT" });
    }

    // ============================================================
    // CASE 4: CANCELLED / FAILED
    // ============================================================
    if (latest_stage === "CANCELLED" || latest_stage === "FAILED") {
      console.log(`🔴 ${latest_stage} — cancelling order`);

      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      order.statusUpdatedAt = new Date();
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: "Cancelled",
        updatedAt: new Date(),
        updatedBy: null,
        note: `Auto-cancelled via Fastrr webhook (${latest_stage})`,
      });

      await order.save();
      return res.json({ success: true, orderId: order._id, type: latest_stage });
    }

    res.json({ success: true, orderId: order._id, type: "UNKNOWN" });
  } catch (err) {
    console.error("Fastrr webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// 🆕 SHIPROCKET LOGISTICS WEBHOOK
// ============================================
router.post("/shiprocket-logistics-webhook", async (req, res) => {
  try {
    console.log("📩 Shiprocket Logistics Webhook received:");
    console.log(JSON.stringify(req.body, null, 2));

    const incomingToken = req.headers["x-api-key"];
    const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || "starlight-secret-2026";

    if (incomingToken && incomingToken !== expectedToken) {
      console.warn(`⚠️ Invalid webhook token`);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const {
      awb,
      current_status,
      shipment_id,
      order_id,
      channel_order_id,
      courier_name,
      scans,
    } = req.body;

    console.log(`📦 Webhook → AWB: ${awb}, Status: ${current_status}, Shipment: ${shipment_id}`);

    let order = null;

    if (awb) {
      order = await Order.findOne({ "shipments.awbCode": awb });
    }

    if (!order && shipment_id) {
      order = await Order.findOne({ "shipments.shipmentId": String(shipment_id) });
    }

    if (!order && channel_order_id) {
      const nativeOrderId = String(channel_order_id).split("-")[0];
      if (nativeOrderId) {
        order = await Order.findById(nativeOrderId).catch(() => null);
      }
    }

    if (!order) {
      console.warn(`⚠️ No order found for webhook`);
      return res.json({ success: true, message: "Order not found but webhook received" });
    }

    console.log(`✅ Order matched: ${order._id}`);

    const statusMap = {
      "PICKED UP": "pickup_scheduled",
      "IN TRANSIT": "in_transit",
      "OUT FOR DELIVERY": "in_transit",
      "DELIVERED": "delivered",
      "RTO": "cancelled",
      "CANCELLED": "cancelled",
      "UNDELIVERED": "cancelled",
    };

    const mappedStatus = statusMap[String(current_status || "").toUpperCase()] || "created";

    order.shipments = (order.shipments || []).map((s) => {
      const shipmentObj = s.toObject ? s.toObject() : s;
      if (shipmentObj.awbCode === awb || shipmentObj.shipmentId === String(shipment_id)) {
        return {
          ...shipmentObj,
          status: mappedStatus,
          trackingUrl: awb ? `https://www.shiprocket.in/tracking?awb=${awb}` : shipmentObj.trackingUrl,
        };
      }
      return shipmentObj;
    });

    if (mappedStatus === "delivered") {
      order.orderStatus = "Delivered";
    } else if (mappedStatus === "in_transit") {
      order.orderStatus = "Shipped";
    } else if (mappedStatus === "cancelled") {
      order.orderStatus = "Cancelled";
    }

    order.statusUpdatedAt = new Date();
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: order.orderStatus,
      updatedAt: new Date(),
      updatedBy: null,
      note: `Shiprocket Logistics: ${current_status} (AWB: ${awb || "N/A"})`,
    });

    await order.save();

    console.log(`✅ Order ${order._id} updated → ${order.orderStatus} (${mappedStatus})`);

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("❌ Shiprocket Logistics webhook error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// FASTrr CHECKOUT — CONFIRM (from frontend)
// ============================================
router.post("/shiprocket-confirm", async (req, res) => {
  try {
    const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (status === "success") {
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      order.shiprocketPaymentId = shiprocketPaymentId || null;
      order.shiprocketOrderId = shiprocketOrderId || null;

      for (const item of order.items) {
        if (item.variantId) {
          await Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId },
            { $inc: { "variants.$.stock": -item.quantity } }
          );
        } else {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
      }

      await Cart.findOneAndDelete({ guestId: order.guestId });
      await pushOrderToShiprocket(order);
    } else {
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("Confirm error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================
// GET ORDERS BY GUEST — FILTERED
// ============================================
router.get("/guest/:guestId", async (req, res) => {
  try {
    const filter = getVisibleOrdersFilter({ guestId: req.params.guestId });
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    console.log(`📋 Guest orders: ${orders.length} visible`);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// GET USER ORDERS — FILTERED
// ============================================
router.get("/user/:userId", async (req, res) => {
  try {
    const filter = getVisibleOrdersFilter({ userId: req.params.userId });
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    console.log(`📋 User orders: ${orders.length} visible`);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// GET SINGLE ORDER
// ============================================
router.get("/single/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================
// CHECK FASTRR COMPATIBILITY
// ============================================
router.post("/check-fastrr-compatibility", async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ compatible: false, reason: "Cart is empty" });
    }

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
    let apiProducts = [];

    try {
      const apiRes = await axios.get(`${BASE_URL}/api/v2/products?page=1&limit=500`, { timeout: 10000 });
      apiProducts = apiRes.data?.data?.products || [];
    } catch (apiErr) {
      return res.status(500).json({ compatible: false, reason: "Fastrr catalog unavailable" });
    }

    for (const item of cartItems) {
      let productName = (item.name || "").trim();

      if (item.productId) {
        try {
          const product = await Product.findById(item.productId);
          if (product) productName = (product.name || product.ProductName || productName).trim();
        } catch (dbErr) {}
      }

      if (!productName) return res.json({ compatible: false, reason: "Product name missing" });

      const lowerName = productName.toLowerCase();
      const normalizedName = normalizeString(productName);

      let matched = apiProducts.find((p) => (p.title || "").trim().toLowerCase() === lowerName);
      if (!matched) matched = apiProducts.find((p) => normalizeString(p.title) === normalizedName);

      if (!matched) {
        return res.json({
          compatible: false,
          reason: `"${productName}" is not yet available for Fastrr checkout.`,
          productName,
        });
      }
    }

    return res.json({ compatible: true });
  } catch (error) {
    return res.status(500).json({ compatible: false, reason: "Check failed", error: error.message });
  }
});

// ============================================
// FASTrr STATUS CHECK
// ============================================
router.get("/fastrr-status/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.json({ synced: false, reason: "product_not_found" });

    const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
    const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, { timeout: 10000 });
    const apiProducts = apiRes.data?.data?.products || [];

    const productName = (product.name || "").trim();
    const normalizedDbName = normalizeString(productName);

    const matched = apiProducts.find((p) => normalizeString(p.title) === normalizedDbName);

    res.json({ synced: !!matched, productName, matchedTitle: matched?.title || null });
  } catch (err) {
    console.error("Fastrr status check error:", err.message);
    res.json({ synced: false, reason: "api_error", error: err.message });
  }
});

// ============================================
// STANDARD PLACE ORDER (COD/PayU)
// ============================================
router.post("/place", async (req, res) => {
  const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!guestId || !shippingAddress) {
    return res.status(400).json({ success: false, message: "Incomplete data" });
  }

  try {
    const cart = await Cart.findOne({ guestId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
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
          vendorId = product.vendorId._id || product.vendorId;
        }
        if (!vendorId && product?.vendor) vendorId = product.vendor;
        if (!vendorId && item.company) {
          const v = await Vendor.findOne({ company: { $regex: new RegExp(`^${item.company}$`, "i") } });
          if (v) vendorId = v._id;
        }

        if (product && product.company) company = product.company;
        else if (product && product.vendorId && product.vendorId.company) company = product.vendorId.company;
        else if (product && product.vendor) {
          const vd = await Vendor.findById(product.vendor);
          if (vd && vd.company) company = vd.company;
        }
        if (!company && vendorId) {
          const v = await Vendor.findById(vendorId);
          if (v && v.company) company = v.company;
        }
        if (!company && item.company) company = item.company;

        return {
          productId: item.productId,
          name: item.name || product?.name || "Unknown Product",
          price: item.price || product?.price || 0,
          quantity: item.quantity || 1,
          stock: product?.stock || 0,
          image: item.variantImage || (Array.isArray(item.image) ? item.image[0] : item.image) || product?.image?.[0] || null,
          vendorId,
          company: company || "N/A",
          weight: product?.weight || 0.5,
          variantId: item.variantId || null,
          selectedColor: item.selectedColor || "",
          selectedSize: item.selectedSize || "",
          variantImage: item.variantImage || "",
          variantPrice: item.variantPrice || 0,
          customFieldLabel: item.customFieldLabel || null,
          customFieldValue: item.customFieldValue || null,
        };
      })
    );

    for (const item of itemsWithVendorInfo) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });

      if (item.variantId && product.variants?.length > 0) {
        const variant = product.variants.id(item.variantId);
        if (!variant || variant.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock: ${product.name}` });
        }
      } else if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock: ${product.name}` });
      }
    }

    let subtotal = cart.items.reduce((a, i) => a + i.price * i.quantity, 0);
    let totalPrice = subtotal;
    let couponData = { code: null, discountType: null, discountValue: 0, discountAmount: 0, couponId: null };

    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (coupon) {
          const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
          const limitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
          const minNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

          if (!isExpired && !limitReached && !minNotMet) {
            let discount = 0;
            if (coupon.discountType === "percentage") {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
            } else {
              discount = Math.min(coupon.discountValue, subtotal);
            }
            totalPrice = subtotal - discount;
            couponData = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
              discountAmount: Number(discount.toFixed(2)),
              couponId: coupon._id,
            };
            coupon.usageCount = (coupon.usageCount || 0) + 1;
            await coupon.save();
          }
        }
      } catch (couponError) {}
    }

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
      subtotal,
      totalPrice,
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
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    await Cart.findOneAndDelete({ guestId });
    await pushOrderToShiprocket(order);

    res.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: { _id: order._id, subtotal: order.subtotal, totalPrice: order.totalPrice, coupon: order.coupon },
    });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;