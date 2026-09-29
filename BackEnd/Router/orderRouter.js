
// // // // // Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT
// // // // // STRICT MATCHING — no random fallback (fixes iframe close for new products)
// // // // const express = require("express");
// // // // const router = express.Router();
// // // // const mongoose = require("mongoose");
// // // // const crypto = require("crypto");
// // // // const Order = require("../Models/Order");
// // // // const Cart = require("../Models/Cart");
// // // // const Vendor = require("../Models/Vendor");
// // // // const SellerDocument = require("../Models/SellerDocument");
// // // // const Product = require("../Models/Product");
// // // // const Coupon = require("../Models/Coupon");
// // // // const axios = require("axios");
// // // // const {
// // // //   sendEmail,
// // // //   getCustomerOrderEmail,
// // // //   getAdminOrderEmail,
// // // //   getVendorOrderEmail,
// // // //   emailMode,
// // // // } = require("../Comfig/emailConfig");

// // // // const shiprocketService = require("../utils/shiprocketService");

// // // // const VENDOR_API_URL =
// // // //   process.env.VENDOR_API_URL ||
// // // //   "https://api.brandelvendor.starlighttechlabsindia.com/api";

// // // // // ============================================
// // // // // PAYU HELPER FUNCTIONS
// // // // // ============================================
// // // // const generatePayUHash = (data) => {
// // // //   const { key, txnid, amount, productinfo, firstname, email, salt } = data;
// // // //   const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
// // // //   console.log("🔑 PayU Hash String:", hashString);
// // // //   return crypto.createHash("sha512").update(hashString).digest("hex");
// // // // };

// // // // const verifyPayUHash = (data) => {
// // // //   const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

// // // //   let hashString;
// // // //   if (additionalCharges) {
// // // //     hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// // // //   } else {
// // // //     hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// // // //   }

// // // //   const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
// // // //   console.log("🔐 Reverse Hash Calculated:", calculatedHash);
// // // //   console.log("🔐 Reverse Hash Received  :", hash);
// // // //   return calculatedHash === hash;
// // // // };

// // // // // ============================================
// // // // // HELPER: Get complete vendor data
// // // // // ============================================
// // // // async function getCompleteVendorData(vendorId) {
// // // //   try {
// // // //     const vendor = await Vendor.findById(vendorId);
// // // //     if (!vendor) return null;

// // // //     const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

// // // //     return {
// // // //       _id: vendor._id,
// // // //       name: vendor.name || vendor.company,
// // // //       company: vendor.company || "N/A",
// // // //       email: vendor.email,
// // // //       phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
// // // //       address: sellerDoc?.contact?.address || "Default Address",
// // // //       city: sellerDoc?.contact?.city || "Mumbai",
// // // //       state: sellerDoc?.contact?.state || "Maharashtra",
// // // //       pincode: sellerDoc?.contact?.pincode || "400001",
// // // //       country: sellerDoc?.contact?.country || "India",
// // // //     };
// // // //   } catch (error) {
// // // //     console.error("Error fetching vendor data:", error.message);
// // // //     return null;
// // // //   }
// // // // }

// // // // // ============================================
// // // // // HELPER: Normalize string for matching
// // // // // ============================================
// // // // const normalizeString = (s) =>
// // // //   (s || "")
// // // //     .toString()
// // // //     .trim()
// // // //     .toLowerCase()
// // // //     .replace(/[^\w\s]/g, "")
// // // //     .replace(/\s+/g, " ");

// // // // // ============================================
// // // // // PLACE ORDER (Standard COD/PayU)
// // // // // ============================================
// // // // router.post("/place", async (req, res) => {
// // // //   const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

// // // //   if (!guestId || !shippingAddress) {
// // // //     return res.status(400).json({ success: false, message: "Incomplete data" });
// // // //   }

// // // //   try {
// // // //     const cart = await Cart.findOne({ guestId });
// // // //     if (!cart || cart.items.length === 0) {
// // // //       return res.status(400).json({ success: false, message: "Cart is empty" });
// // // //     }

// // // //     const itemsWithVendorInfo = await Promise.all(
// // // //       cart.items.map(async (item) => {
// // // //         const product = await Product.findById(item.productId).populate({
// // // //           path: "vendorId",
// // // //           select: "company name email _id",
// // // //         });

// // // //         let company = null;
// // // //         let vendorId = null;

// // // //         if (product?.vendorId) {
// // // //           if (product.vendorId._id) vendorId = product.vendorId._id;
// // // //           else vendorId = product.vendorId;
// // // //         }
// // // //         if (!vendorId && product?.vendor) vendorId = product.vendor;
// // // //         if (!vendorId && item.company) {
// // // //           const vendorByCompany = await Vendor.findOne({
// // // //             company: { $regex: new RegExp(`^${item.company}$`, "i") },
// // // //           });
// // // //           if (vendorByCompany) vendorId = vendorByCompany._id;
// // // //         }

// // // //         if (product && product.company) company = product.company;
// // // //         else if (product && product.vendorId && product.vendorId.company)
// // // //           company = product.vendorId.company;
// // // //         else if (product && product.vendor) {
// // // //           const vendorDoc = await Vendor.findById(product.vendor);
// // // //           if (vendorDoc && vendorDoc.company) company = vendorDoc.company;
// // // //         }
// // // //         if (!company && vendorId) {
// // // //           const vendor = await Vendor.findById(vendorId);
// // // //           if (vendor && vendor.company) company = vendor.company;
// // // //         }
// // // //         if (!company && item.company) company = item.company;

// // // //         const variantImage = item.variantImage || null;
// // // //         const variantPrice = item.variantPrice || 0;
// // // //         const customFieldLabel = item.customFieldLabel || null;
// // // //         const customFieldValue = item.customFieldValue || null;

// // // //         return {
// // // //           productId: item.productId,
// // // //           name: item.name || product?.name || "Unknown Product",
// // // //           price: item.price || product?.price || 0,
// // // //           quantity: item.quantity || 1,
// // // //           stock: product?.stock || 0,
// // // //           image: variantImage
// // // //             ? variantImage
// // // //             : Array.isArray(item.image)
// // // //             ? item.image[0]
// // // //             : item.image || product?.image?.[0] || null,
// // // //           vendorId: vendorId,
// // // //           company: company || "N/A",
// // // //           weight: product?.weight || 0.5,
// // // //           variantId: item.variantId || null,
// // // //           selectedColor: item.selectedColor || "",
// // // //           selectedSize: item.selectedSize || "",
// // // //           variantImage: item.variantImage || "",
// // // //           variantPrice: variantPrice,
// // // //           customFieldLabel: customFieldLabel,
// // // //           customFieldValue: customFieldValue,
// // // //         };
// // // //       })
// // // //     );

// // // //     // Stock validation
// // // //     for (const item of itemsWithVendorInfo) {
// // // //       const product = await Product.findById(item.productId);
// // // //       if (!product) {
// // // //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// // // //       }

// // // //       if (item.variantId && product.variants && product.variants.length > 0) {
// // // //         const variant = product.variants.id(item.variantId);
// // // //         if (!variant) {
// // // //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// // // //         }
// // // //         if (variant.stock < item.quantity) {
// // // //           return res.status(400).json({
// // // //             success: false,
// // // //             message: `Insufficient stock for ${product.name}. Available: ${variant.stock}`,
// // // //           });
// // // //         }
// // // //       } else {
// // // //         if (product.stock < item.quantity) {
// // // //           return res.status(400).json({
// // // //             success: false,
// // // //             message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
// // // //           });
// // // //         }
// // // //       }
// // // //     }

// // // //     let subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
// // // //     let totalPrice = subtotal;
// // // //     let couponData = {
// // // //       code: null,
// // // //       discountType: null,
// // // //       discountValue: 0,
// // // //       discountAmount: 0,
// // // //       couponId: null,
// // // //     };

// // // //     if (couponCode) {
// // // //       try {
// // // //         const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

// // // //         if (coupon) {
// // // //           const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
// // // //           const usageLimitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
// // // //           const minOrderNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

// // // //           if (!isExpired && !usageLimitReached && !minOrderNotMet) {
// // // //             let discountAmount = 0;

// // // //             if (coupon.discountType === "percentage") {
// // // //               discountAmount = (subtotal * coupon.discountValue) / 100;
// // // //               if (coupon.maxDiscountAmount) {
// // // //                 discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
// // // //               }
// // // //             } else {
// // // //               discountAmount = Math.min(coupon.discountValue, subtotal);
// // // //             }

// // // //             totalPrice = subtotal - discountAmount;

// // // //             couponData = {
// // // //               code: coupon.code,
// // // //               discountType: coupon.discountType,
// // // //               discountValue: coupon.discountValue,
// // // //               discountAmount: Number(discountAmount.toFixed(2)),
// // // //               couponId: coupon._id,
// // // //             };

// // // //             coupon.usageCount = (coupon.usageCount || 0) + 1;
// // // //             await coupon.save();
// // // //           }
// // // //         }
// // // //       } catch (couponError) {
// // // //         console.error("Coupon validation error:", couponError);
// // // //       }
// // // //     }

// // // //     const isOnlinePayment =
// // // //       paymentMethod === "PayU" || paymentMethod === "Online" ||
// // // //       paymentMethod === "upi" || paymentMethod === "card";

// // // //     const order = new Order({
// // // //       guestId,
// // // //       items: itemsWithVendorInfo.map((item) => ({
// // // //         productId: item.productId,
// // // //         name: item.name,
// // // //         price: item.price,
// // // //         quantity: item.quantity,
// // // //         stockAtPurchase: item.stock,
// // // //         image: item.image ? [item.image] : [],
// // // //         vendorId: item.vendorId,
// // // //         company: item.company,
// // // //         weight: item.weight || 0.5,
// // // //         variantId: item.variantId || null,
// // // //         selectedColor: item.selectedColor || "",
// // // //         selectedSize: item.selectedSize || "",
// // // //         variantImage: item.variantImage || "",
// // // //         variantPrice: item.variantPrice || 0,
// // // //         customFieldLabel: item.customFieldLabel || null,
// // // //         customFieldValue: item.customFieldValue || null,
// // // //       })),
// // // //       shippingAddress,
// // // //       paymentMethod: paymentMethod || "COD",
// // // //       paymentStatus: "Pending",
// // // //       subtotal: subtotal,
// // // //       totalPrice: totalPrice,
// // // //       coupon: couponData,
// // // //       orderStatus: "Pending",
// // // //     });

// // // //     await order.save();

// // // //     for (const item of itemsWithVendorInfo) {
// // // //       if (item.variantId) {
// // // //         await Product.updateOne(
// // // //           { _id: item.productId, "variants._id": item.variantId },
// // // //           { $inc: { "variants.$.stock": -item.quantity } }
// // // //         );
// // // //       } else {
// // // //         await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
// // // //       }
// // // //     }

// // // //     await Cart.findOneAndDelete({ guestId });

// // // //     const orderId = order._id;

// // // //     // SHIPROCKET INTEGRATION
// // // //     let shipmentResults = [];
// // // //     let shiprocketSyncStatus = "pending";

// // // //     try {
// // // //       if (process.env.SHIPROCKET_ENABLED === "true") {
// // // //         const vendorItemsMap = {};

// // // //         for (const item of itemsWithVendorInfo) {
// // // //           if (item.vendorId) {
// // // //             const vendorId = item.vendorId.toString();
// // // //             if (!vendorItemsMap[vendorId]) vendorItemsMap[vendorId] = [];
// // // //             vendorItemsMap[vendorId].push({ ...item, weight: item.weight || 0.5 });
// // // //           }
// // // //         }

// // // //         const vendorIds = Object.keys(vendorItemsMap);

// // // //         if (vendorIds.length > 0) {
// // // //           for (const vendorId of vendorIds) {
// // // //             try {
// // // //               const vendorData = await getCompleteVendorData(vendorId);
// // // //               if (!vendorData) {
// // // //                 shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
// // // //                 continue;
// // // //               }

// // // //               const vendorItems = vendorItemsMap[vendorId];
// // // //               const result = await shiprocketService.createVendorShipment(
// // // //                 order, vendorData, vendorItems, shippingAddress
// // // //               );
// // // //               shipmentResults.push(result);
// // // //             } catch (vendorError) {
// // // //               shipmentResults.push({ vendorId, success: false, error: vendorError.message });
// // // //             }
// // // //           }

// // // //           const successfulShipments = shipmentResults.filter((r) => r.success);
// // // //           order.shipments = successfulShipments.map((r) => ({
// // // //             vendorId: r.vendorId,
// // // //             company: r.company,
// // // //             shipmentId: r.shipmentId,
// // // //             orderId: r.orderId,
// // // //             awbCode: r.awbCode,
// // // //             labelUrl: r.labelUrl,
// // // //             status: "created",
// // // //             createdAt: new Date(),
// // // //           }));

// // // //           if (successfulShipments.length === shipmentResults.length) {
// // // //             shiprocketSyncStatus = "synced";
// // // //           } else if (successfulShipments.length > 0) {
// // // //             shiprocketSyncStatus = "partial";
// // // //           } else {
// // // //             shiprocketSyncStatus = "failed";
// // // //           }

// // // //           order.shiprocketSyncStatus = shiprocketSyncStatus;
// // // //           await order.save();
// // // //         } else {
// // // //           order.shiprocketSyncStatus = "skipped";
// // // //           await order.save();
// // // //         }
// // // //       } else {
// // // //         order.shiprocketSyncStatus = "disabled";
// // // //         await order.save();
// // // //       }
// // // //     } catch (shiprocketError) {
// // // //       order.shiprocketSyncStatus = "failed";
// // // //       order.shiprocketError = shiprocketError.message;
// // // //       await order.save();
// // // //     }

// // // //     // EMAILS
// // // //     const emailResults = { customer: false, admin: false, vendors: [] };

// // // //     const customerEmail = shippingAddress.email;
// // // //     if (customerEmail && !isOnlinePayment) {
// // // //       try {
// // // //         const customerHtml = getCustomerOrderEmail(order, orderId);
// // // //         const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// // // //         emailResults.customer = result.success;
// // // //       } catch (error) {
// // // //         console.error("Error sending customer email:", error.message);
// // // //       }
// // // //     }

// // // //     const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// // // //     if (adminEmail) {
// // // //       try {
// // // //         const adminHtml = getAdminOrderEmail(order, orderId);
// // // //         const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
// // // //         emailResults.admin = result.success;
// // // //       } catch (error) {
// // // //         console.error("Error sending admin email:", error.message);
// // // //       }
// // // //     }

// // // //     const vendorGroups = new Map();
// // // //     for (const item of itemsWithVendorInfo) {
// // // //       if (item.company && item.company !== "N/A") {
// // // //         const company = item.company;
// // // //         if (!vendorGroups.has(company)) {
// // // //           vendorGroups.set(company, { company, items: [], vendorId: item.vendorId });
// // // //         }
// // // //         vendorGroups.get(company).items.push(item);
// // // //       }
// // // //     }

// // // //     for (const [company, vendorData] of vendorGroups) {
// // // //       try {
// // // //         let vendor = await Vendor.findOne({ company }).select("email name company phone");
// // // //         if (!vendor) {
// // // //           vendor = await Vendor.findOne({
// // // //             company: { $regex: new RegExp(`^${company}$`, "i") },
// // // //           }).select("email name company phone");
// // // //         }

// // // //         if (vendor && vendor.email) {
// // // //           const vendorHtml = getVendorOrderEmail(order, orderId, vendorData.items, {
// // // //             name: vendor.name || company,
// // // //             email: vendor.email,
// // // //             shopName: company,
// // // //             phone: vendor?.phone || "N/A",
// // // //           });

// // // //           const result = await sendEmail(
// // // //             vendor.email,
// // // //             `New Order Received for ${company} - Order #${orderId}`,
// // // //             vendorHtml
// // // //           );
// // // //           emailResults.vendors.push({ company, email: vendor.email, success: result.success });
// // // //         }
// // // //       } catch (vendorErr) {
// // // //         console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
// // // //       }
// // // //     }

// // // //     // VENDOR NOTIFICATIONS
// // // //     const notificationResults = [];
// // // //     for (const [company, vendorData] of vendorGroups) {
// // // //       try {
// // // //         const vendorItems = vendorData.items;
// // // //         const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

// // // //         const notificationData = {
// // // //           company,
// // // //           title: "🛒 New Order Received!",
// // // //           message: `You have received a new order #${orderId.toString().slice(-6)}.\n\nTotal Amount: ₹${vendorTotal}\nItems: ${vendorItems.length} product(s)\nCustomer: ${shippingAddress?.name || "Customer"}\nPhone: ${shippingAddress?.phone || "N/A"}\nOrder Date: ${new Date().toLocaleString()}\n\nPlease check and process the order.`,
// // // //           read: false,
// // // //           orderId: orderId,
// // // //         };

// // // //         await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
// // // //           headers: { "Content-Type": "application/json" },
// // // //           timeout: 5000,
// // // //         });
// // // //         notificationResults.push({ company, success: true });
// // // //       } catch (vendorError) {
// // // //         notificationResults.push({ company, success: false, error: vendorError.message });
// // // //       }
// // // //     }

// // // //     // PAYU PARAMS
// // // //     let payuParams = null;
// // // //     if (isOnlinePayment) {
// // // //       const txnid = `TXN_${Date.now()}_${order._id}`;
// // // //       order.payuTxnId = txnid;
// // // //       await order.save();

// // // //       const cleanAmount = Number(order.totalPrice).toFixed(2);

// // // //       const hashData = {
// // // //         key: process.env.PAYU_KEY,
// // // //         txnid: txnid,
// // // //         amount: cleanAmount,
// // // //         productinfo: "Order Payment",
// // // //         firstname: shippingAddress.name,
// // // //         email: shippingAddress.email,
// // // //         salt: process.env.PAYU_SALT,
// // // //       };

// // // //       const hash = generatePayUHash(hashData);

// // // //       payuParams = {
// // // //         key: process.env.PAYU_KEY,
// // // //         txnid: txnid,
// // // //         amount: cleanAmount,
// // // //         productinfo: "Order Payment",
// // // //         firstname: shippingAddress.name,
// // // //         email: shippingAddress.email,
// // // //         phone: shippingAddress.phone,
// // // //         surl: `${process.env.BACKEND_URL}/api/order/payu/success`,
// // // //         furl: `${process.env.BACKEND_URL}/api/order/payu/failure`,
// // // //         hash: hash,
// // // //         service_provider: "payu_paisa",
// // // //       };
// // // //     }

// // // //     res.json({
// // // //       success: true,
// // // //       message: "Order placed successfully",
// // // //       orderId: order._id,
// // // //       order: {
// // // //         _id: order._id,
// // // //         subtotal: order.subtotal,
// // // //         totalPrice: order.totalPrice,
// // // //         coupon: order.coupon,
// // // //         discountApplied: order.coupon.discountAmount > 0,
// // // //       },
// // // //       payuParams: payuParams,
// // // //       shipments: shipmentResults,
// // // //       shiprocketSyncStatus: shiprocketSyncStatus,
// // // //       emailResults: emailResults,
// // // //       notificationResults: notificationResults,
// // // //       vendorCount: vendorGroups.size,
// // // //       emailMode: emailMode,
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Order placement error:", err);
// // // //     res.status(500).json({
// // // //       success: false,
// // // //       message: "Server error",
// // // //       error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
// // // //     });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // PAYU SUCCESS CALLBACK
// // // // // ============================================
// // // // router.post("/payu/success", async (req, res) => {
// // // //   try {
// // // //     const responseData = req.body;

// // // //     const isValid = verifyPayUHash({
// // // //       ...responseData,
// // // //       salt: process.env.PAYU_SALT,
// // // //       key: process.env.PAYU_KEY,
// // // //     });

// // // //     if (!isValid) {
// // // //       console.error("❌ PayU Hash verification failed");
// // // //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// // // //     }

// // // //     const orderId = responseData.txnid.split("_")[2];

// // // //     const order = await Order.findByIdAndUpdate(
// // // //       orderId,
// // // //       {
// // // //         paymentStatus: "Paid",
// // // //         payuPaymentId: responseData.mihpayid,
// // // //         orderStatus: "Processing",
// // // //       },
// // // //       { new: true }
// // // //     );

// // // //     if (!order) {
// // // //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // // //     }

// // // //     try {
// // // //       const customerEmail = order.shippingAddress.email;
// // // //       if (customerEmail) {
// // // //         const customerHtml = getCustomerOrderEmail(order, orderId);
// // // //         await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// // // //       }
// // // //     } catch (emailErr) {
// // // //       console.error("Error sending post-payment email:", emailErr);
// // // //     }

// // // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=success&orderId=${orderId}`);
// // // //   } catch (error) {
// // // //     console.error("PayU Success Error:", error);
// // // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // // //   }
// // // // });

// // // // // ============================================
// // // // // PAYU FAILURE CALLBACK
// // // // // ============================================
// // // // router.post("/payu/failure", async (req, res) => {
// // // //   try {
// // // //     const responseData = req.body;
// // // //     const orderId = responseData.txnid ? responseData.txnid.split("_")[2] : null;

// // // //     if (orderId) {
// // // //       await Order.findByIdAndUpdate(orderId, {
// // // //         paymentStatus: "Failed",
// // // //         orderStatus: "Cancelled",
// // // //       });
// // // //     }

// // // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// // // //   } catch (error) {
// // // //     console.error("PayU Failure Error:", error);
// // // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // // //   }
// // // // });

// // // // // ============================================
// // // // // FASTrr STATUS CHECK — Is product in Fastrr catalog?
// // // // // GET /api/order/fastrr-status/:productId
// // // // // ============================================
// // // // router.get("/fastrr-status/:productId", async (req, res) => {
// // // //   try {
// // // //     const product = await Product.findById(req.params.productId);
// // // //     if (!product) return res.json({ synced: false, reason: "product_not_found" });

// // // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
// // // //     const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, {
// // // //       timeout: 10000,
// // // //     });
// // // //     const apiProducts = apiRes.data?.data?.products || [];

// // // //     const productName = (product.name || "").trim();
// // // //     const normalizedDbName = normalizeString(productName);

// // // //     const matched = apiProducts.find(
// // // //       (p) => normalizeString(p.title) === normalizedDbName
// // // //     );

// // // //     res.json({
// // // //       synced: !!matched,
// // // //       productName,
// // // //       matchedTitle: matched?.title || null,
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Fastrr status check error:", err.message);
// // // //     res.json({ synced: false, reason: "api_error", error: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // CHECK FASTRR COMPATIBILITY (Pre-check before checkout)
// // // // // POST /api/order/check-fastrr-compatibility
// // // // // ============================================
// // // // router.post("/check-fastrr-compatibility", async (req, res) => {
// // // //   try {
// // // //     const { cartItems } = req.body;

// // // //     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
// // // //       return res.status(400).json({
// // // //         compatible: false,
// // // //         reason: "Cart is empty",
// // // //       });
// // // //     }

// // // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// // // //     // Fetch Fastrr catalog
// // // //     let apiProducts = [];
// // // //     try {
// // // //       const apiRes = await axios.get(
// // // //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// // // //         { timeout: 10000 }
// // // //       );
// // // //       apiProducts = apiRes.data?.data?.products || [];
// // // //       console.log(`📦 [Compat Check] Fetched ${apiProducts.length} Fastrr products`);
// // // //     } catch (apiErr) {
// // // //       console.error("❌ [Compat Check] Fastrr catalog fetch failed:", apiErr.message);
// // // //       return res.status(500).json({
// // // //         compatible: false,
// // // //         reason: "Fastrr catalog service is currently unavailable. Please use standard checkout.",
// // // //       });
// // // //     }

// // // //     // Check each cart item against Fastrr catalog
// // // //     for (const item of cartItems) {
// // // //       let productName = (item.name || "").trim();

// // // //       if (item.productId) {
// // // //         try {
// // // //           const product = await Product.findById(item.productId);
// // // //           if (product) {
// // // //             productName = (product.name || product.ProductName || productName).trim();
// // // //           }
// // // //         } catch (dbErr) {
// // // //           console.warn(`[Compat Check] Product lookup failed for ${item.productId}:`, dbErr.message);
// // // //         }
// // // //       }

// // // //       if (!productName) {
// // // //         return res.json({
// // // //           compatible: false,
// // // //           reason: "Product name missing for compatibility check.",
// // // //           productId: item.productId,
// // // //         });
// // // //       }

// // // //       const lowerName = productName.toLowerCase();
// // // //       const normalizedName = normalizeString(productName);

// // // //       // ✅ Strict exact match (case-insensitive)
// // // //       let matched = apiProducts.find(
// // // //         (p) => (p.title || "").trim().toLowerCase() === lowerName
// // // //       );

// // // //       // ✅ Second attempt — normalized
// // // //       if (!matched) {
// // // //         matched = apiProducts.find(
// // // //           (p) => normalizeString(p.title) === normalizedName
// // // //         );
// // // //       }

// // // //       if (!matched) {
// // // //         console.warn(`⚠️ [Compat Check] "${productName}" NOT in Fastrr catalog`);
// // // //         return res.json({
// // // //           compatible: false,
// // // //           reason: `"${productName}" is not yet available for Fastrr checkout.`,
// // // //           productName,
// // // //           productId: item.productId,
// // // //         });
// // // //       }

// // // //       console.log(`✅ [Compat Check] Matched: "${matched.title}"`);
// // // //     }

// // // //     // All items are compatible
// // // //     return res.json({ compatible: true });
// // // //   } catch (error) {
// // // //     console.error("Fastrr compatibility check error:", error.message);
// // // //     return res.status(500).json({
// // // //       compatible: false,
// // // //       reason: "Compatibility check failed. Please use standard checkout.",
// // // //       error: error.message,
// // // //     });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // FASTrr CHECKOUT — CREATE ORDER + ACCESS TOKEN
// // // // // STRICT MATCHING — no random fallback
// // // // // POST /api/order/shiprocket-checkout
// // // // // ============================================
// // // // router.post("/shiprocket-checkout", async (req, res) => {
// // // //   try {
// // // //     const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

// // // //     if (!guestId || !cartItems || cartItems.length === 0) {
// // // //       return res.status(400).json({ success: false, message: "Invalid cart" });
// // // //     }

// // // //     if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
// // // //       return res.status(400).json({ success: false, message: "Shipping address required" });
// // // //     }

// // // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// // // //     // Fetch Fastrr catalog
// // // //     let apiProducts = [];
// // // //     try {
// // // //       const apiRes = await axios.get(
// // // //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// // // //         { timeout: 10000 }
// // // //       );
// // // //       apiProducts = apiRes.data?.data?.products || [];
// // // //       console.log(`📦 Fetched ${apiProducts.length} products from /api/v2/products`);
// // // //     } catch (apiErr) {
// // // //       console.error("❌ Failed to fetch /api/v2/products:", apiErr.message);
// // // //       return res.status(500).json({
// // // //         success: false,
// // // //         code: "FASTRR_CATALOG_UNAVAILABLE",
// // // //         message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
// // // //       });
// // // //     }

// // // //     const itemsWithVendorInfo = [];

// // // //     for (const item of cartItems) {
// // // //       const product = await Product.findById(item.productId).populate({
// // // //         path: "vendorId",
// // // //         select: "company name email _id",
// // // //       });

// // // //       if (!product) {
// // // //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// // // //       }

// // // //       let effectiveStock = product.stock || 0;
// // // //       let variantIdx = 0;
// // // //       let variantDoc = null;

// // // //       if (item.variantId && product.variants && product.variants.length > 0) {
// // // //         variantDoc = product.variants.id(item.variantId);
// // // //         if (!variantDoc) {
// // // //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// // // //         }
// // // //         effectiveStock = variantDoc.stock || 0;
// // // //         variantIdx = product.variants.findIndex(
// // // //           (v) => v._id && v._id.toString() === item.variantId.toString()
// // // //         );
// // // //         if (variantIdx < 0) variantIdx = 0;
// // // //       }

// // // //       if (effectiveStock < item.quantity) {
// // // //         return res.status(400).json({
// // // //           success: false,
// // // //           message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
// // // //         });
// // // //       }

// // // //       let vendorId = null;
// // // //       if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
// // // //       else if (product.vendorId) vendorId = product.vendorId;
// // // //       else if (product.vendor) vendorId = product.vendor;

// // // //       const productName = (product.name || product.ProductName || "").trim();

// // // //       console.log(`🔍 Looking for product in Fastrr catalog: "${productName}"`);

// // // //       // ✅ STRICT EXACT MATCH ONLY (case-insensitive)
// // // //       let matchedApiProduct = apiProducts.find((p) => {
// // // //         const apiTitle = (p.title || "").trim().toLowerCase();
// // // //         return apiTitle === productName.toLowerCase();
// // // //       });

// // // //       // ✅ SECOND ATTEMPT — normalized (remove punctuation, collapse spaces)
// // // //       if (!matchedApiProduct) {
// // // //         const normalizedDbName = normalizeString(productName);
// // // //         matchedApiProduct = apiProducts.find(
// // // //           (p) => normalizeString(p.title) === normalizedDbName
// // // //         );
// // // //       }

// // // //       // ❌ Product NOT in Fastrr catalog → clean error
// // // //       if (!matchedApiProduct) {
// // // //         console.warn(`⚠️ Product "${productName}" NOT in Fastrr catalog.`);
// // // //         console.warn(`   First 10 available titles:`);
// // // //         apiProducts.slice(0, 10).forEach((p) => console.warn(`   - "${p.title}"`));

// // // //         return res.status(400).json({
// // // //           success: false,
// // // //           code: "FASTRR_CATALOG_MISSING",
// // // //           message: `"${productName}" is not yet available for Fastrr checkout. It may still be syncing. Please use standard checkout (COD/PayU).`,
// // // //           productName,
// // // //           productId: item.productId,
// // // //         });
// // // //       }

// // // //       console.log(`✅ Matched Fastrr product: "${matchedApiProduct.title}" (ID: ${matchedApiProduct.id})`);

// // // //       let shiprocketVariantId = null;

// // // //       if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
// // // //         if (variantDoc) {
// // // //           const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();
// // // //           console.log(`   Looking for variant: "${variantTitle}"`);

// // // //           const matchedApiVariant = matchedApiProduct.variants.find((av) => {
// // // //             const apiVariantTitle = (av.title || "").trim().toLowerCase();
// // // //             return apiVariantTitle === variantTitle;
// // // //           });

// // // //           if (matchedApiVariant) {
// // // //             shiprocketVariantId = matchedApiVariant.id;
// // // //             console.log(`   ✅ Matched variant by title -> ${shiprocketVariantId}`);
// // // //           } else {
// // // //             shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
// // // //               || matchedApiProduct.variants[0]?.id
// // // //               || null;
// // // //             console.log(`   ⚠️ Variant title not matched, using index ${variantIdx} -> ${shiprocketVariantId}`);
// // // //           }
// // // //         } else {
// // // //           shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
// // // //           console.log(`   ✅ No variant, using first -> ${shiprocketVariantId}`);
// // // //         }
// // // //       }

// // // //       if (!shiprocketVariantId) {
// // // //         console.warn(`⚠️ No Fastrr variant ID for "${productName}".`);
// // // //         return res.status(400).json({
// // // //           success: false,
// // // //           code: "FASTRR_VARIANT_MISSING",
// // // //           message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
// // // //           productName,
// // // //           productId: item.productId,
// // // //         });
// // // //       }

// // // //       console.log(`🛒 Item: ${productName} | variantIdx: ${variantIdx} | Fastrr ID: ${shiprocketVariantId}`);

// // // //       itemsWithVendorInfo.push({
// // // //         productId: item.productId,
// // // //         variantId: item.variantId || null,
// // // //         shiprocketVariantId,
// // // //         name: item.name || product.name,
// // // //         price: item.price || product.price,
// // // //         quantity: item.quantity,
// // // //         stock: effectiveStock,
// // // //         image: Array.isArray(item.image) ? item.image : [item.image],
// // // //         vendorId,
// // // //         company: product.company || product.vendorId?.company || "N/A",
// // // //         weight: product.weight || 0.5,
// // // //         selectedColor: item.selectedColor || "",
// // // //         selectedSize: item.selectedSize || "",
// // // //         variantImage: item.variantImage || "",
// // // //         variantPrice: item.variantPrice || 0,
// // // //         customFieldLabel: item.customFieldLabel || null,
// // // //         customFieldValue: item.customFieldValue || null,
// // // //         sku: item.sku || "",
// // // //       });
// // // //     }

// // // //     // Create order in DB (Pending)
// // // //     const order = new Order({
// // // //       guestId,
// // // //       items: itemsWithVendorInfo,
// // // //       shippingAddress,
// // // //       paymentMethod: "Shiprocket",
// // // //       paymentStatus: "Pending",
// // // //       subtotal,
// // // //       totalPrice: total,
// // // //       orderStatus: "Pending",
// // // //       coupon: couponCode
// // // //         ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
// // // //         : { code: null, discountAmount: 0 },
// // // //     });

// // // //     await order.save();

// // // //     // Build Fastrr payload
// // // //     const accessTokenPayload = {
// // // //       cart_data: {
// // // //         items: itemsWithVendorInfo.map((i) => ({
// // // //           variant_id: String(i.shiprocketVariantId),
// // // //           quantity: Number(i.quantity),
// // // //         })),
// // // //       },
// // // //       redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`,
// // // //       timestamp: new Date().toISOString(),
// // // //     };

// // // //     const payloadString = JSON.stringify(accessTokenPayload);

// // // //     const hmac = crypto
// // // //       .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
// // // //       .update(payloadString)
// // // //       .digest("base64");

// // // //     console.log("🔑 Fastrr Access Token Request:");
// // // //     console.log("Payload String:", payloadString);
// // // //     console.log("HMAC:", hmac);
// // // //     console.log("API Key:", process.env.SHIPROCKET_CHECKOUT_API_KEY);

// // // //     let accessToken = null;
// // // //     let shiprocketOrderId = null;

// // // //     try {
// // // //       const tokenResponse = await axios.post(
// // // //         "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
// // // //         payloadString,
// // // //         {
// // // //           headers: {
// // // //             "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
// // // //             "X-Api-HMAC-SHA256": hmac,
// // // //             "Content-Type": "application/json",
// // // //           },
// // // //           timeout: 15000,
// // // //         }
// // // //       );

// // // //       console.log("✅ Fastrr Access Token Response:", JSON.stringify(tokenResponse.data));

// // // //       accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
// // // //       shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
// // // //         || tokenResponse.data?.result?.order_id
// // // //         || tokenResponse.data?.order_id
// // // //         || null;

// // // //       if (shiprocketOrderId) {
// // // //         order.shiprocketOrderId = shiprocketOrderId;
// // // //         await order.save();
// // // //       }
// // // //     } catch (tokenErr) {
// // // //       console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);

// // // //       return res.status(500).json({
// // // //         success: false,
// // // //         message: "Failed to generate checkout token",
// // // //         error: tokenErr.response?.data || tokenErr.message,
// // // //       });
// // // //     }

// // // //     if (!accessToken) {
// // // //       return res.status(500).json({
// // // //         success: false,
// // // //         message: "No access token received from Fastrr",
// // // //       });
// // // //     }

// // // //     res.json({
// // // //       success: true,
// // // //       orderId: order._id,
// // // //       accessToken,
// // // //       shiprocketOrderId,
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Shiprocket checkout create error:", err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // FASTrr CHECKOUT — ORDER WEBHOOK
// // // // // POST /api/order/shiprocket-webhook
// // // // // ============================================
// // // // // ============================================
// // // // // FASTrr CHECKOUT — ORDER WEBHOOK (UPDATED FOR REAL FASTRR PAYLOAD)
// // // // // Fastrr mokale: cart_id, latest_stage, paymentDetails.paymentMode, shipping_address
// // // // // ============================================
// // // // router.post("/shiprocket-webhook", async (req, res) => {
// // // //   try {
// // // //     console.log("📩 Fastrr Order Webhook received:", JSON.stringify(req.body, null, 2));

// // // //     const {
// // // //       cart_id,              // ✅ Fastrr nu cart ID
// // // //       latest_stage,         // ✅ INIT | PAYMENT_INITIATED | ORDER_PLACED | CANCELLED | FAILED
// // // //       email,
// // // //       phone_number,         // ✅ Fastrr "phone" nahi, "phone_number" use kare
// // // //       first_name,
// // // //       last_name,
// // // //       total_price,          // ✅ Fastrr "total_amount_payable" nahi, "total_price" use kare
// // // //       shipping_address,     // ✅ Already object
// // // //       billing_address,
// // // //       paymentDetails,       // ✅ { paymentMode, amount, paymentGateway, transactionId }
// // // //     } = req.body;

// // // //     // ✅ Payment detection from nested paymentDetails
// // // //     const rawPaymentMode = String(
// // // //       paymentDetails?.paymentMode || ""
// // // //     ).toLowerCase().trim();

// // // //     const isCOD = rawPaymentMode === "cod";
// // // //     const isPaid =
// // // //       latest_stage === "ORDER_PLACED" &&
// // // //       paymentDetails &&
// // // //       ["upi", "card", "netbanking", "wallet", "prepaid"].includes(rawPaymentMode);

// // // //     console.log(`💳 Payment detection → paymentMode: "${rawPaymentMode}", stage: "${latest_stage}", isCOD: ${isCOD}, isPaid: ${isPaid}`);

// // // //     // ============================================================
// // // //     // ✅ 4-STEP ORDER MATCHING (from most to least reliable)
// // // //     // ============================================================
// // // //     let order = null;
// // // //     let matchSource = null;

// // // //     // ✅ TRY 1: cart_id (most reliable)
// // // //     if (cart_id) {
// // // //       order = await Order.findOne({ fastrrCartId: cart_id });
// // // //       if (order) matchSource = "fastrrCartId";
// // // //     }

// // // //     // ✅ TRY 2: shiprocketOrderId (agar Order ma set hoy to)
// // // //     if (!order && req.body.order_id) {
// // // //       order = await Order.findOne({ shiprocketOrderId: req.body.order_id });
// // // //       if (order) matchSource = "shiprocketOrderId";
// // // //     }

// // // //     // ✅ TRY 3: email OR phone (recent pending Shiprocket orders)
// // // //     if (!order && (email || phone_number)) {
// // // //       const query = {
// // // //         paymentMethod: "Shiprocket",
// // // //         paymentStatus: "Pending",
// // // //         orderStatus: { $ne: "Cancelled" },
// // // //         createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // last 1 hour
// // // //       };
// // // //       const orConditions = [];
// // // //       if (email) orConditions.push({ "shippingAddress.email": email });
// // // //       if (phone_number) orConditions.push({ "shippingAddress.phone": phone_number });
// // // //       if (orConditions.length > 0) query.$or = orConditions;

// // // //       order = await Order.findOne(query).sort({ createdAt: -1 });
// // // //       if (order) matchSource = "email/phone";
// // // //     }

// // // //     // ✅ TRY 4: LAST RESORT — Most recent pending Shiprocket order (last 30 min)
// // // //     if (!order) {
// // // //       order = await Order.findOne({
// // // //         paymentMethod: "Shiprocket",
// // // //         paymentStatus: "Pending",
// // // //         orderStatus: { $ne: "Cancelled" },
// // // //         createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
// // // //       }).sort({ createdAt: -1 });
// // // //       if (order) matchSource = "recent-pending-fallback";
// // // //     }

// // // //     if (!order) {
// // // //       console.warn("⚠️ No matching order found for webhook. cart_id:", cart_id);
// // // //       return res.json({ success: true, message: "Order not found but webhook received" });
// // // //     }

// // // //     console.log(`✅ Order matched via ${matchSource}: ${order._id}`);

// // // //     // ✅ Save fastrrCartId for future webhooks (idempotency)
// // // //     if (cart_id && !order.fastrrCartId) {
// // // //       order.fastrrCartId = cart_id;
// // // //     }

// // // //     // ✅ Skip if already cancelled
// // // //     if (order.orderStatus === "Cancelled") {
// // // //       console.log(`⚠️ Order ${order._id} already cancelled — skipping webhook`);
// // // //       await order.save();
// // // //       return res.json({ success: true, message: "Order already cancelled" });
// // // //     }

// // // //     // ============================================================
// // // //     // ✅ BUILD REAL ADDRESS from Fastrr's shipping_address
// // // //     // ============================================================
// // // //     const buildAddressFromFastrr = (addr, fallbackEmail, fallbackPhone) => {
// // // //       if (!addr) return null;
// // // //       const fullName = `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || addr.name || "Customer";
// // // //       return {
// // // //         name: fullName,
// // // //         email: fallbackEmail || order.shippingAddress?.email || "",
// // // //         phone: addr.phone || fallbackPhone || order.shippingAddress?.phone || "",
// // // //         address: [addr.address1, addr.address2].filter(Boolean).join(", ") || "Address not provided",
// // // //         city: addr.city || "",
// // // //         state: addr.state || "",
// // // //         pincode: addr.zip || addr.pincode || "",
// // // //         country: addr.country || "India",
// // // //       };
// // // //     };

// // // //     const realShippingAddress = buildAddressFromFastrr(
// // // //       shipping_address,
// // // //       email,
// // // //       phone_number
// // // //     );

// // // //     // ============================================================
// // // //     // ✅ CASE 1: ORDER PLACED (payment done OR COD confirmed)
// // // //     // ============================================================
// // // //     if (latest_stage === "ORDER_PLACED") {
// // // //       console.log(`🟢 ORDER_PLACED detected — isCOD: ${isCOD}, isPaid: ${isPaid}`);

// // // //       if (isCOD) {
// // // //         order.paymentMethod = "COD";
// // // //         order.paymentStatus = "Pending";
// // // //       } else {
// // // //         order.paymentMethod = rawPaymentMode
// // // //           ? rawPaymentMode.charAt(0).toUpperCase() + rawPaymentMode.slice(1)
// // // //           : "Prepaid";
// // // //         order.paymentStatus = "Paid";
// // // //         if (paymentDetails?.transactionId) {
// // // //           order.shiprocketPaymentId = String(paymentDetails.transactionId);
// // // //         }
// // // //       }

// // // //       order.orderStatus = "Processing";
// // // //       order.totalPrice = total_price || order.totalPrice;

// // // //       // ✅ Update shipping address with real one
// // // //       if (realShippingAddress) {
// // // //         order.shippingAddress = realShippingAddress;
// // // //         console.log(`✅ Real address updated: ${realShippingAddress.city} - ${realShippingAddress.pincode}`);
// // // //       }

// // // //       // ✅ Track status change
// // // //       order.statusUpdatedAt = new Date();
// // // //       order.statusUpdatedBy = null;
// // // //       order.statusHistory = order.statusHistory || [];
// // // //       order.statusHistory.push({
// // // //         status: "Processing",
// // // //         updatedAt: new Date(),
// // // //         updatedBy: null,
// // // //         note: isCOD
// // // //           ? "COD order confirmed via Fastrr webhook"
// // // //           : `Paid via ${order.paymentMethod} (Fastrr webhook)`,
// // // //       });

// // // //       await order.save();

// // // //       // ✅ Decrement stock
// // // //       for (const item of order.items) {
// // // //         if (item.variantId) {
// // // //           await Product.updateOne(
// // // //             { _id: item.productId, "variants._id": item.variantId },
// // // //             { $inc: { "variants.$.stock": -item.quantity } }
// // // //           );
// // // //         } else {
// // // //           await Product.findByIdAndUpdate(item.productId, {
// // // //             $inc: { stock: -item.quantity },
// // // //           });
// // // //         }
// // // //       }

// // // //       await Cart.findOneAndDelete({ guestId: order.guestId });

// // // //       // ✅ Send confirmation email
// // // //       try {
// // // //         const customerEmail = order.shippingAddress?.email;
// // // //         if (customerEmail) {
// // // //           const html = getCustomerOrderEmail(order, order._id);
// // // //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// // // //         }
// // // //       } catch (emailErr) {
// // // //         console.error("Email error:", emailErr.message);
// // // //       }

// // // //       try {
// // // //         const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// // // //         if (adminEmail) {
// // // //           const adminHtml = getAdminOrderEmail(order, order._id);
// // // //           await sendEmail(adminEmail, `New Order (Fastrr) - #${order._id}`, adminHtml);
// // // //         }
// // // //       } catch (emailErr) {
// // // //         console.error("Admin email error:", emailErr.message);
// // // //       }

// // // //       return res.json({ success: true, orderId: order._id, type: "ORDER_PLACED" });
// // // //     }

// // // //     // ============================================================
// // // //     // ✅ CASE 2: PAYMENT_INITIATED — Save real address, keep pending
// // // //     // ============================================================
// // // //     if (latest_stage === "PAYMENT_INITIATED") {
// // // //       console.log(`🟡 PAYMENT_INITIATED — saving real address, keeping order pending`);

// // // //       if (realShippingAddress) {
// // // //         order.shippingAddress = realShippingAddress;
// // // //         console.log(`✅ Address saved (pending): ${realShippingAddress.city}`);
// // // //       }

// // // //       // Save fastrrCartId
// // // //       if (cart_id) order.fastrrCartId = cart_id;

// // // //       await order.save();

// // // //       return res.json({ success: true, orderId: order._id, type: "PAYMENT_INITIATED" });
// // // //     }

// // // //     // ============================================================
// // // //     // ✅ CASE 3: INIT — Just save cart_id for later matching
// // // //     // ============================================================
// // // //     if (latest_stage === "INIT") {
// // // //       console.log(`🔵 INIT — saving fastrrCartId for later matching`);

// // // //       if (cart_id) order.fastrrCartId = cart_id;
// // // //       await order.save();

// // // //       return res.json({ success: true, orderId: order._id, type: "INIT" });
// // // //     }

// // // //     // ============================================================
// // // //     // ✅ CASE 4: CANCELLED / FAILED
// // // //     // ============================================================
// // // //     if (latest_stage === "CANCELLED" || latest_stage === "FAILED") {
// // // //       console.log(`🔴 ${latest_stage} — cancelling order`);

// // // //       order.paymentStatus = "Failed";
// // // //       order.orderStatus = "Cancelled";
// // // //       order.statusUpdatedAt = new Date();
// // // //       order.statusHistory = order.statusHistory || [];
// // // //       order.statusHistory.push({
// // // //         status: "Cancelled",
// // // //         updatedAt: new Date(),
// // // //         updatedBy: null,
// // // //         note: `Auto-cancelled via Fastrr webhook (${latest_stage})`,
// // // //       });

// // // //       await order.save();
// // // //       return res.json({ success: true, orderId: order._id, type: latest_stage });
// // // //     }

// // // //     console.log(`⚠️ Unknown latest_stage: ${latest_stage}`);
// // // //     res.json({ success: true, orderId: order._id, type: "UNKNOWN_STAGE" });
// // // //   } catch (err) {
// // // //     console.error("Fastrr webhook error:", err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // FASTrr CHECKOUT — CONFIRM (from frontend)
// // // // // ============================================
// // // // router.post("/shiprocket-confirm", async (req, res) => {
// // // //   try {
// // // //     const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

// // // //     if (!orderId) {
// // // //       return res.status(400).json({ success: false, message: "orderId required" });
// // // //     }

// // // //     const order = await Order.findById(orderId);
// // // //     if (!order) {
// // // //       return res.status(404).json({ success: false, message: "Order not found" });
// // // //     }

// // // //     if (status === "success") {
// // // //       order.paymentStatus = "Paid";
// // // //       order.orderStatus = "Processing";
// // // //       order.shiprocketPaymentId = shiprocketPaymentId || null;
// // // //       order.shiprocketOrderId = shiprocketOrderId || null;

// // // //       for (const item of order.items) {
// // // //         if (item.variantId) {
// // // //           await Product.updateOne(
// // // //             { _id: item.productId, "variants._id": item.variantId },
// // // //             { $inc: { "variants.$.stock": -item.quantity } }
// // // //           );
// // // //         } else {
// // // //           await Product.findByIdAndUpdate(item.productId, {
// // // //             $inc: { stock: -item.quantity },
// // // //           });
// // // //         }
// // // //       }

// // // //       await Cart.findOneAndDelete({ guestId: order.guestId });

// // // //       try {
// // // //         const customerEmail = order.shippingAddress?.email;
// // // //         if (customerEmail) {
// // // //           const html = getCustomerOrderEmail(order, order._id);
// // // //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// // // //         }
// // // //       } catch (emailErr) {
// // // //         console.error("Email error:", emailErr.message);
// // // //       }
// // // //     } else {
// // // //       order.paymentStatus = "Failed";
// // // //       order.orderStatus = "Cancelled";
// // // //     }

// // // //     await order.save();
// // // //     res.json({ success: true, order });
// // // //   } catch (err) {
// // // //     console.error("Confirm error:", err);
// // // //     res.status(500).json({ success: false, message: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // GET SINGLE ORDER
// // // // // ============================================
// // // // router.get("/single/:orderId", async (req, res) => {
// // // //   try {
// // // //     const order = await Order.findById(req.params.orderId);
// // // //     if (!order) return res.status(404).json({ message: "Order not found" });
// // // //     res.json(order);
// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({ message: "Server error" });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // GET ORDERS BY GUEST
// // // // // ============================================
// // // // router.get("/guest/:guestId", async (req, res) => {
// // // //   try {
// // // //     const orders = await Order.find({ guestId: req.params.guestId }).sort({ createdAt: -1 });
// // // //     res.json(orders);
// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({ message: "Server error" });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // GET USER ORDERS
// // // // // ============================================
// // // // router.get("/user/:userId", async (req, res) => {
// // // //   try {
// // // //     const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
// // // //     res.json(orders);
// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({ message: "Server error" });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // ADMIN: GET ORDER WITH COMMISSION
// // // // // ============================================
// // // // router.get("/admin/commission/:orderId", async (req, res) => {
// // // //   try {
// // // //     const order = await Order.findById(req.params.orderId);
// // // //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// // // //     let totalAdminCommission = 0;
// // // //     let totalVendorCommission = 0;
// // // //     const vendorBreakdown = {};

// // // //     for (const item of order.items) {
// // // //       if (item.vendorId) {
// // // //         const vendorIdStr = item.vendorId.toString();
// // // //         const vendor = await Vendor.findById(item.vendorId).populate("planId");

// // // //         let commissionPercentage = 8;
// // // //         if (vendor && vendor.planId) {
// // // //           commissionPercentage = vendor.planId.commissionPercentage || 8;
// // // //         }

// // // //         const itemTotal = item.price * item.quantity;
// // // //         const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // // //         const adminCommission = itemTotal - vendorCommission;

// // // //         totalVendorCommission += vendorCommission;
// // // //         totalAdminCommission += adminCommission;

// // // //         if (!vendorBreakdown[vendorIdStr]) {
// // // //           vendorBreakdown[vendorIdStr] = {
// // // //             company: item.company || "Unknown",
// // // //             vendorId: item.vendorId,
// // // //             vendorName: vendor?.name || "Unknown",
// // // //             vendorEmail: vendor?.email || "N/A",
// // // //             commissionPercentage: commissionPercentage,
// // // //             items: [],
// // // //             totalItemValue: 0,
// // // //             totalVendorCommission: 0,
// // // //             totalAdminCommission: 0,
// // // //           };
// // // //         }

// // // //         vendorBreakdown[vendorIdStr].items.push({
// // // //           name: item.name,
// // // //           price: item.price,
// // // //           quantity: item.quantity,
// // // //           total: itemTotal,
// // // //           vendorCommission: vendorCommission,
// // // //           adminCommission: adminCommission,
// // // //           selectedColor: item.selectedColor || "",
// // // //           selectedSize: item.selectedSize || "",
// // // //           variantImage: item.variantImage || "",
// // // //           customFieldLabel: item.customFieldLabel || null,
// // // //           customFieldValue: item.customFieldValue || null,
// // // //         });

// // // //         vendorBreakdown[vendorIdStr].totalItemValue += itemTotal;
// // // //         vendorBreakdown[vendorIdStr].totalVendorCommission += vendorCommission;
// // // //         vendorBreakdown[vendorIdStr].totalAdminCommission += adminCommission;
// // // //       }
// // // //     }

// // // //     res.json({
// // // //       success: true,
// // // //       orderId: order._id,
// // // //       orderStatus: order.orderStatus,
// // // //       paymentStatus: order.paymentStatus,
// // // //       subtotal: order.subtotal || order.totalPrice,
// // // //       totalPrice: order.totalPrice,
// // // //       coupon: order.coupon || null,
// // // //       createdAt: order.createdAt,
// // // //       shippingAddress: order.shippingAddress,
// // // //       paymentMethod: order.paymentMethod,
// // // //       shipments: order.shipments || [],
// // // //       shiprocketSyncStatus: order.shiprocketSyncStatus,
// // // //       shiprocketError: order.shiprocketError || null,
// // // //       commissionSummary: {
// // // //         totalAdminCommission,
// // // //         totalVendorCommission,
// // // //         platformCommissionRate:
// // // //           order.totalPrice > 0
// // // //             ? ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // // //             : "0%",
// // // //         vendorCommissionRate:
// // // //           order.totalPrice > 0
// // // //             ? ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // // //             : "0%",
// // // //       },
// // // //       vendorBreakdown: Object.values(vendorBreakdown),
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Commission view error:", err);
// // // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // ADMIN: GET ALL ORDERS WITH COMMISSIONS
// // // // // ============================================
// // // // router.get("/admin/commissions", async (req, res) => {
// // // //   try {
// // // //     const { startDate, endDate, vendorId, status } = req.query;
// // // //     let filter = {};
// // // //     if (startDate && endDate) {
// // // //       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
// // // //     }
// // // //     if (status) filter.orderStatus = status;

// // // //     const orders = await Order.find(filter).sort({ createdAt: -1 });
// // // //     const orderSummaries = [];
// // // //     let totalAdminCommission = 0;
// // // //     let totalVendorCommission = 0;
// // // //     let totalRevenue = 0;

// // // //     for (const order of orders) {
// // // //       let orderAdminCommission = 0;
// // // //       let orderVendorCommission = 0;
// // // //       const vendorSet = new Set();

// // // //       for (const item of order.items) {
// // // //         if (item.vendorId) {
// // // //           vendorSet.add(item.vendorId.toString());
// // // //           const vendor = await Vendor.findById(item.vendorId).populate("planId");
// // // //           let commissionPercentage = 8;
// // // //           if (vendor && vendor.planId) {
// // // //             commissionPercentage = vendor.planId.commissionPercentage || 8;
// // // //           }
// // // //           const itemTotal = item.price * item.quantity;
// // // //           const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // // //           const adminCommission = itemTotal - vendorCommission;
// // // //           orderVendorCommission += vendorCommission;
// // // //           orderAdminCommission += adminCommission;
// // // //         }
// // // //       }

// // // //       totalAdminCommission += orderAdminCommission;
// // // //       totalVendorCommission += orderVendorCommission;
// // // //       totalRevenue += order.totalPrice || 0;

// // // //       orderSummaries.push({
// // // //         _id: order._id,
// // // //         subtotal: order.subtotal || order.totalPrice,
// // // //         totalPrice: order.totalPrice,
// // // //         coupon: order.coupon || null,
// // // //         orderStatus: order.orderStatus,
// // // //         paymentStatus: order.paymentStatus,
// // // //         createdAt: order.createdAt,
// // // //         vendorCount: vendorSet.size,
// // // //         shipmentCount: order.shipments?.length || 0,
// // // //         shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// // // //         adminCommission: orderAdminCommission,
// // // //         vendorCommission: orderVendorCommission,
// // // //         platformCommissionRate:
// // // //           order.totalPrice > 0
// // // //             ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // // //             : "0%",
// // // //       });
// // // //     }

// // // //     let filteredSummaries = orderSummaries;
// // // //     if (vendorId) {
// // // //       const filteredOrders = await Order.find({ ...filter, "items.vendorId": vendorId }).sort({ createdAt: -1 });
// // // //       const filteredResults = [];
// // // //       let filteredAdminCommission = 0;
// // // //       let filteredVendorCommission = 0;
// // // //       let filteredRevenue = 0;

// // // //       for (const order of filteredOrders) {
// // // //         let orderAdminCommission = 0;
// // // //         let orderVendorCommission = 0;
// // // //         const vendorSet = new Set();

// // // //         for (const item of order.items) {
// // // //           if (item.vendorId && item.vendorId.toString() === vendorId) {
// // // //             vendorSet.add(item.vendorId.toString());
// // // //             const vendor = await Vendor.findById(item.vendorId).populate("planId");
// // // //             let commissionPercentage = 8;
// // // //             if (vendor && vendor.planId) {
// // // //               commissionPercentage = vendor.planId.commissionPercentage || 8;
// // // //             }
// // // //             const itemTotal = item.price * item.quantity;
// // // //             const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // // //             const adminCommission = itemTotal - vendorCommission;
// // // //             orderVendorCommission += vendorCommission;
// // // //             orderAdminCommission += adminCommission;
// // // //           }
// // // //         }

// // // //         filteredAdminCommission += orderAdminCommission;
// // // //         filteredVendorCommission += orderVendorCommission;
// // // //         filteredRevenue += order.totalPrice || 0;

// // // //         filteredResults.push({
// // // //           _id: order._id,
// // // //           subtotal: order.subtotal || order.totalPrice,
// // // //           totalPrice: order.totalPrice,
// // // //           coupon: order.coupon || null,
// // // //           orderStatus: order.orderStatus,
// // // //           paymentStatus: order.paymentStatus,
// // // //           createdAt: order.createdAt,
// // // //           vendorCount: vendorSet.size,
// // // //           shipmentCount: order.shipments?.length || 0,
// // // //           shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// // // //           adminCommission: orderAdminCommission,
// // // //           vendorCommission: orderVendorCommission,
// // // //           platformCommissionRate:
// // // //             order.totalPrice > 0
// // // //               ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // // //               : "0%",
// // // //         });
// // // //       }

// // // //       filteredSummaries = filteredResults;
// // // //       totalAdminCommission = filteredAdminCommission;
// // // //       totalVendorCommission = filteredVendorCommission;
// // // //       totalRevenue = filteredRevenue;
// // // //     }

// // // //     res.json({
// // // //       success: true,
// // // //       summary: {
// // // //         totalOrders: filteredSummaries.length,
// // // //         totalRevenue,
// // // //         totalAdminCommission,
// // // //         totalVendorCommission,
// // // //         platformCommissionRate:
// // // //           totalRevenue > 0
// // // //             ? ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + "%"
// // // //             : "0%",
// // // //       },
// // // //       orders: filteredSummaries,
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Admin commissions fetch error:", err);
// // // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // ADMIN: UPDATE ORDER STATUS
// // // // // ============================================
// // // // router.put("/admin/status/:orderId", async (req, res) => {
// // // //   try {
// // // //     const { status } = req.body;
// // // //     const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// // // //     if (!validStatuses.includes(status)) {
// // // //       return res.status(400).json({
// // // //         success: false,
// // // //         message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
// // // //       });
// // // //     }

// // // //     const order = await Order.findByIdAndUpdate(
// // // //       req.params.orderId,
// // // //       { orderStatus: status },
// // // //       { new: true }
// // // //     );

// // // //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// // // //     res.json({
// // // //       success: true,
// // // //       message: "Order status updated successfully",
// // // //       order: {
// // // //         _id: order._id,
// // // //         orderStatus: order.orderStatus,
// // // //         updatedAt: order.updatedAt,
// // // //         shipments: order.shipments || [],
// // // //         shiprocketSyncStatus: order.shiprocketSyncStatus,
// // // //       },
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("Order status update error:", err);
// // // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // // //   }
// // // // });

// // // // // ============================================
// // // // // SEND ORDER CONFIRMATION EMAIL (Manual)
// // // // // ============================================
// // // // router.post("/send-confirmation", async (req, res) => {
// // // //   try {
// // // //     const {
// // // //       to, subject, orderId, customerName, items, subtotal,
// // // //       couponDiscount, shippingCost, total, paymentMethod, orderDate,
// // // //     } = req.body;

// // // //     if (!to) return res.status(400).json({ success: false, message: "Recipient email is required" });

// // // //     const html = `
// // // //       <!DOCTYPE html>
// // // //       <html><head><meta charset="UTF-8"><style>
// // // //         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
// // // //         .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; }
// // // //         .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
// // // //         .header h1 { color: #fff; margin: 0; }
// // // //         .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
// // // //         .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
// // // //         .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
// // // //         .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
// // // //       </style></head>
// // // //       <body><div class="container">
// // // //         <div class="header"><h1>🎉 Order Confirmed!</h1><p>Thank you, ${customerName || "Customer"}!</p></div>
// // // //         <div style="padding: 20px;">
// // // //           <p><strong>📋 Order #:</strong> ${orderId}</p>
// // // //           <p><strong>📅 Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
// // // //           <p><strong>💳 Payment:</strong> ${paymentMethod || "COD"}</p>
// // // //           <h3>🛍️ Order Items</h3>
// // // //           <table class="items-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
// // // //           <tbody>${(items || []).map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("")}</tbody></table>
// // // //           <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
// // // //             <div><span>Subtotal</span><span style="float:right;">₹${(subtotal || 0).toFixed(2)}</span></div>
// // // //             ${couponDiscount > 0 ? `<div style="color:#28a745;"><span>Discount</span><span style="float:right;">-₹${(couponDiscount || 0).toFixed(2)}</span></div>` : ""}
// // // //             <div><span>Shipping</span><span style="float:right;">${shippingCost === 0 ? "FREE" : `₹${(shippingCost || 0).toFixed(2)}`}</span></div>
// // // //             <div style="font-size:20px; font-weight:bold; border-top:2px solid #28a745; margin-top:10px; padding-top:10px;"><span>Total</span><span style="float:right; color:#28a745;">₹${(total || 0).toFixed(2)}</span></div>
// // // //           </div>
// // // //           <div class="footer"><p>Thank you for shopping with us! 🛍️</p></div>
// // // //         </div>
// // // //       </div></body></html>`;

// // // //     const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);
// // // //     if (result.success) {
// // // //       res.json({ success: true, message: "Email sent successfully" });
// // // //     } else {
// // // //       res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
// // // //     }
// // // //   } catch (err) {
// // // //     console.error("Send confirmation error:", err);
// // // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // // //   }
// // // // });

// // // // module.exports = router;

// // // // Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT + AUTO SHIPROCKET PUSH
// // // // ✅ FIX: COD orders always visible, Fastrr/Shiprocket orders visible only after payment
// // // // ✅ FIX: Pending Fastrr orders hidden from order list
// // // // ✅ FIX: Cancelled orders hidden from order list
// // // // ✅ FIX: Real Fastrr payload detection (cart_id, latest_stage, paymentDetails)
// // // // ✅ FIX: 4-step order matching
// // // // ✅ FIX: Real address from Fastrr webhook
// // // // ✅ FIX: Auto push to Shiprocket Logistics on ORDER_PLACED
// // // const express = require("express");
// // // const router = express.Router();
// // // const mongoose = require("mongoose");
// // // const crypto = require("crypto");
// // // const Order = require("../Models/Order");
// // // const Cart = require("../Models/Cart");
// // // const Vendor = require("../Models/Vendor");
// // // const SellerDocument = require("../Models/SellerDocument");
// // // const Product = require("../Models/Product");
// // // const Coupon = require("../Models/Coupon");
// // // const axios = require("axios");
// // // const {
// // //   sendEmail,
// // //   getCustomerOrderEmail,
// // //   getAdminOrderEmail,
// // //   getVendorOrderEmail,
// // //   emailMode,
// // // } = require("../Comfig/emailConfig");

// // // const shiprocketService = require("../utils/shiprocketService");

// // // const VENDOR_API_URL =
// // //   process.env.VENDOR_API_URL ||
// // //   "https://api.brandelvendor.starlighttechlabsindia.com/api";

// // // // ============================================
// // // // HELPER: Order visibility filter
// // // // ============================================
// // // const getVisibleOrdersFilter = (extraFilter = {}) => {
// // //   return {
// // //     ...extraFilter,
// // //     orderStatus: { $nin: ["Cancelled"] },
// // //     $or: [
// // //       {
// // //         paymentMethod: {
// // //           $in: [
// // //             "COD",
// // //             "cod",
// // //             "Cod",
// // //             "Cash on Delivery",
// // //             "cash on delivery",
// // //             "cash_on_delivery",
// // //           ],
// // //         },
// // //       },
// // //       { paymentStatus: "Paid" },
// // //     ],
// // //   };
// // // };

// // // // ============================================
// // // // HELPER: Detect placeholder addresses
// // // // ============================================
// // // const isPlaceholderAddress = (addr) => {
// // //   if (!addr) return true;
// // //   const a = String(addr.address || "").toLowerCase();
// // //   const e = String(addr.email || "").toLowerCase();
// // //   const p = String(addr.phone || "");
// // //   return (
// // //     !a ||
// // //     a.includes("pending") ||
// // //     a.includes("will be provided") ||
// // //     a.includes("will be captured") ||
// // //     e === "pending@fastrr-checkout.com" ||
// // //     e === "guest@native91.com" ||
// // //     p === "0000000000" ||
// // //     p === "9999999999"
// // //   );
// // // };

// // // // ============================================
// // // // PAYU HELPER FUNCTIONS
// // // // ============================================
// // // const generatePayUHash = (data) => {
// // //   const { key, txnid, amount, productinfo, firstname, email, salt } = data;
// // //   const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
// // //   console.log("🔑 PayU Hash String:", hashString);
// // //   return crypto.createHash("sha512").update(hashString).digest("hex");
// // // };

// // // const verifyPayUHash = (data) => {
// // //   const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

// // //   let hashString;
// // //   if (additionalCharges) {
// // //     hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// // //   } else {
// // //     hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// // //   }

// // //   const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
// // //   console.log("🔐 Reverse Hash Calculated:", calculatedHash);
// // //   console.log("🔐 Reverse Hash Received  :", hash);
// // //   return calculatedHash === hash;
// // // };

// // // // ============================================
// // // // HELPER: Get complete vendor data
// // // // ============================================
// // // async function getCompleteVendorData(vendorId) {
// // //   try {
// // //     const vendor = await Vendor.findById(vendorId);
// // //     if (!vendor) return null;

// // //     const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

// // //     return {
// // //       _id: vendor._id,
// // //       name: vendor.name || vendor.company,
// // //       company: vendor.company || "N/A",
// // //       email: vendor.email,
// // //       phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
// // //       address: sellerDoc?.contact?.address || "Default Address",
// // //       city: sellerDoc?.contact?.city || "Mumbai",
// // //       state: sellerDoc?.contact?.state || "Maharashtra",
// // //       pincode: sellerDoc?.contact?.pincode || "400001",
// // //       country: sellerDoc?.contact?.country || "India",
// // //     };
// // //   } catch (error) {
// // //     console.error("Error fetching vendor data:", error.message);
// // //     return null;
// // //   }
// // // }

// // // // ============================================
// // // // HELPER: Normalize string for matching
// // // // ============================================
// // // const normalizeString = (s) =>
// // //   (s || "")
// // //     .toString()
// // //     .trim()
// // //     .toLowerCase()
// // //     .replace(/[^\w\s]/g, "")
// // //     .replace(/\s+/g, " ");

// // // // ============================================
// // // // HELPER: Push order to Shiprocket Logistics
// // // // ============================================
// // // async function pushOrderToShiprocket(order) {
// // //   try {
// // //     if (process.env.SHIPROCKET_ENABLED !== "true") {
// // //       console.log("ℹ️ Shiprocket disabled — skipping push");
// // //       order.shiprocketSyncStatus = "disabled";
// // //       await order.save();
// // //       return;
// // //     }

// // //     console.log(`🚀 Pushing order ${order._id} to Shiprocket Logistics...`);

// // //     // Group items by vendor
// // //     const vendorItemsMap = {};
// // //     for (const item of order.items) {
// // //       const vid = item.vendorId?.toString();
// // //       if (!vid) continue;
// // //       if (!vendorItemsMap[vid]) vendorItemsMap[vid] = [];
// // //       vendorItemsMap[vid].push(item);
// // //     }

// // //     const vendorIds = Object.keys(vendorItemsMap);

// // //     if (vendorIds.length === 0) {
// // //       console.warn("⚠️ No vendor IDs found — skipping Shiprocket push");
// // //       order.shiprocketSyncStatus = "skipped";
// // //       order.shiprocketError = "No vendor IDs found in items";
// // //       await order.save();
// // //       return;
// // //     }

// // //     const shipmentResults = [];

// // //     for (const vendorId of vendorIds) {
// // //       try {
// // //         const vendorData = await getCompleteVendorData(vendorId);
// // //         if (!vendorData) {
// // //           console.warn(`⚠️ Vendor not found: ${vendorId}`);
// // //           shipmentResults.push({
// // //             vendorId,
// // //             success: false,
// // //             error: "Vendor not found",
// // //           });
// // //           continue;
// // //         }

// // //         const vendorItems = vendorItemsMap[vendorId];

// // //         const result = await shiprocketService.createVendorShipment(
// // //           order,
// // //           vendorData,
// // //           vendorItems,
// // //           order.shippingAddress
// // //         );

// // //         shipmentResults.push(result);

// // //         if (result.success) {
// // //           console.log(
// // //             `✅ Shipment created for ${vendorData.company}: ${result.shipmentId}`
// // //           );
// // //         } else {
// // //           console.error(
// // //             `❌ Shipment failed for ${vendorData.company}: ${result.error}`
// // //           );
// // //         }
// // //       } catch (vendorErr) {
// // //         console.error(`❌ Vendor shipment error (${vendorId}):`, vendorErr.message);
// // //         shipmentResults.push({
// // //           vendorId,
// // //           success: false,
// // //           error: vendorErr.message,
// // //         });
// // //       }
// // //     }

// // //     const successfulShipments = shipmentResults.filter((r) => r.success);

// // //     order.shipments = successfulShipments.map((r) => ({
// // //       vendorId: r.vendorId,
// // //       company: r.company,
// // //       shipmentId: r.shipmentId,
// // //       orderId: r.orderId,
// // //       awbCode: r.awbCode,
// // //       labelUrl: r.labelUrl,
// // //       status: "created",
// // //       createdAt: new Date(),
// // //     }));

// // //     if (successfulShipments.length === shipmentResults.length) {
// // //       order.shiprocketSyncStatus = "synced";
// // //     } else if (successfulShipments.length > 0) {
// // //       order.shiprocketSyncStatus = "partial";
// // //     } else {
// // //       order.shiprocketSyncStatus = "failed";
// // //     }

// // //     await order.save();

// // //     console.log(
// // //       `📦 Shiprocket sync: ${successfulShipments.length}/${shipmentResults.length} — status: ${order.shiprocketSyncStatus}`
// // //     );
// // //   } catch (err) {
// // //     console.error("❌ Shiprocket push error:", err.message);
// // //     order.shiprocketSyncStatus = "failed";
// // //     order.shiprocketError = err.message;
// // //     await order.save();
// // //   }
// // // }

// // // // ============================================
// // // // PLACE ORDER (Standard COD/PayU)
// // // // ============================================
// // // router.post("/place", async (req, res) => {
// // //   const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

// // //   if (!guestId || !shippingAddress) {
// // //     return res.status(400).json({ success: false, message: "Incomplete data" });
// // //   }

// // //   try {
// // //     const cart = await Cart.findOne({ guestId });
// // //     if (!cart || cart.items.length === 0) {
// // //       return res.status(400).json({ success: false, message: "Cart is empty" });
// // //     }

// // //     const itemsWithVendorInfo = await Promise.all(
// // //       cart.items.map(async (item) => {
// // //         const product = await Product.findById(item.productId).populate({
// // //           path: "vendorId",
// // //           select: "company name email _id",
// // //         });

// // //         let company = null;
// // //         let vendorId = null;

// // //         if (product?.vendorId) {
// // //           if (product.vendorId._id) vendorId = product.vendorId._id;
// // //           else vendorId = product.vendorId;
// // //         }
// // //         if (!vendorId && product?.vendor) vendorId = product.vendor;
// // //         if (!vendorId && item.company) {
// // //           const vendorByCompany = await Vendor.findOne({
// // //             company: { $regex: new RegExp(`^${item.company}$`, "i") },
// // //           });
// // //           if (vendorByCompany) vendorId = vendorByCompany._id;
// // //         }

// // //         if (product && product.company) company = product.company;
// // //         else if (product && product.vendorId && product.vendorId.company)
// // //           company = product.vendorId.company;
// // //         else if (product && product.vendor) {
// // //           const vendorDoc = await Vendor.findById(product.vendor);
// // //           if (vendorDoc && vendorDoc.company) company = vendorDoc.company;
// // //         }
// // //         if (!company && vendorId) {
// // //           const vendor = await Vendor.findById(vendorId);
// // //           if (vendor && vendor.company) company = vendor.company;
// // //         }
// // //         if (!company && item.company) company = item.company;

// // //         const variantImage = item.variantImage || null;
// // //         const variantPrice = item.variantPrice || 0;
// // //         const customFieldLabel = item.customFieldLabel || null;
// // //         const customFieldValue = item.customFieldValue || null;

// // //         return {
// // //           productId: item.productId,
// // //           name: item.name || product?.name || "Unknown Product",
// // //           price: item.price || product?.price || 0,
// // //           quantity: item.quantity || 1,
// // //           stock: product?.stock || 0,
// // //           image: variantImage
// // //             ? variantImage
// // //             : Array.isArray(item.image)
// // //             ? item.image[0]
// // //             : item.image || product?.image?.[0] || null,
// // //           vendorId: vendorId,
// // //           company: company || "N/A",
// // //           weight: product?.weight || 0.5,
// // //           variantId: item.variantId || null,
// // //           selectedColor: item.selectedColor || "",
// // //           selectedSize: item.selectedSize || "",
// // //           variantImage: item.variantImage || "",
// // //           variantPrice: variantPrice,
// // //           customFieldLabel: customFieldLabel,
// // //           customFieldValue: customFieldValue,
// // //         };
// // //       })
// // //     );

// // //     // Stock validation
// // //     for (const item of itemsWithVendorInfo) {
// // //       const product = await Product.findById(item.productId);
// // //       if (!product) {
// // //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// // //       }

// // //       if (item.variantId && product.variants && product.variants.length > 0) {
// // //         const variant = product.variants.id(item.variantId);
// // //         if (!variant) {
// // //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// // //         }
// // //         if (variant.stock < item.quantity) {
// // //           return res.status(400).json({
// // //             success: false,
// // //             message: `Insufficient stock for ${product.name}. Available: ${variant.stock}`,
// // //           });
// // //         }
// // //       } else {
// // //         if (product.stock < item.quantity) {
// // //           return res.status(400).json({
// // //             success: false,
// // //             message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
// // //           });
// // //         }
// // //       }
// // //     }

// // //     let subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
// // //     let totalPrice = subtotal;
// // //     let couponData = {
// // //       code: null,
// // //       discountType: null,
// // //       discountValue: 0,
// // //       discountAmount: 0,
// // //       couponId: null,
// // //     };

// // //     if (couponCode) {
// // //       try {
// // //         const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

// // //         if (coupon) {
// // //           const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
// // //           const usageLimitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
// // //           const minOrderNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

// // //           if (!isExpired && !usageLimitReached && !minOrderNotMet) {
// // //             let discountAmount = 0;

// // //             if (coupon.discountType === "percentage") {
// // //               discountAmount = (subtotal * coupon.discountValue) / 100;
// // //               if (coupon.maxDiscountAmount) {
// // //                 discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
// // //               }
// // //             } else {
// // //               discountAmount = Math.min(coupon.discountValue, subtotal);
// // //             }

// // //             totalPrice = subtotal - discountAmount;

// // //             couponData = {
// // //               code: coupon.code,
// // //               discountType: coupon.discountType,
// // //               discountValue: coupon.discountValue,
// // //               discountAmount: Number(discountAmount.toFixed(2)),
// // //               couponId: coupon._id,
// // //             };

// // //             coupon.usageCount = (coupon.usageCount || 0) + 1;
// // //             await coupon.save();
// // //           }
// // //         }
// // //       } catch (couponError) {
// // //         console.error("Coupon validation error:", couponError);
// // //       }
// // //     }

// // //     const isOnlinePayment =
// // //       paymentMethod === "PayU" || paymentMethod === "Online" ||
// // //       paymentMethod === "upi" || paymentMethod === "card";

// // //     const order = new Order({
// // //       guestId,
// // //       items: itemsWithVendorInfo.map((item) => ({
// // //         productId: item.productId,
// // //         name: item.name,
// // //         price: item.price,
// // //         quantity: item.quantity,
// // //         stockAtPurchase: item.stock,
// // //         image: item.image ? [item.image] : [],
// // //         vendorId: item.vendorId,
// // //         company: item.company,
// // //         weight: item.weight || 0.5,
// // //         variantId: item.variantId || null,
// // //         selectedColor: item.selectedColor || "",
// // //         selectedSize: item.selectedSize || "",
// // //         variantImage: item.variantImage || "",
// // //         variantPrice: item.variantPrice || 0,
// // //         customFieldLabel: item.customFieldLabel || null,
// // //         customFieldValue: item.customFieldValue || null,
// // //       })),
// // //       shippingAddress,
// // //       paymentMethod: paymentMethod || "COD",
// // //       paymentStatus: "Pending",
// // //       subtotal: subtotal,
// // //       totalPrice: totalPrice,
// // //       coupon: couponData,
// // //       orderStatus: "Pending",
// // //     });

// // //     await order.save();

// // //     for (const item of itemsWithVendorInfo) {
// // //       if (item.variantId) {
// // //         await Product.updateOne(
// // //           { _id: item.productId, "variants._id": item.variantId },
// // //           { $inc: { "variants.$.stock": -item.quantity } }
// // //         );
// // //       } else {
// // //         await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
// // //       }
// // //     }

// // //     await Cart.findOneAndDelete({ guestId });

// // //     const orderId = order._id;

// // //     // SHIPROCKET INTEGRATION
// // //     let shipmentResults = [];
// // //     let shiprocketSyncStatus = "pending";

// // //     try {
// // //       if (process.env.SHIPROCKET_ENABLED === "true") {
// // //         const vendorItemsMap = {};

// // //         for (const item of itemsWithVendorInfo) {
// // //           if (item.vendorId) {
// // //             const vendorId = item.vendorId.toString();
// // //             if (!vendorItemsMap[vendorId]) vendorItemsMap[vendorId] = [];
// // //             vendorItemsMap[vendorId].push({ ...item, weight: item.weight || 0.5 });
// // //           }
// // //         }

// // //         const vendorIds = Object.keys(vendorItemsMap);

// // //         if (vendorIds.length > 0) {
// // //           for (const vendorId of vendorIds) {
// // //             try {
// // //               const vendorData = await getCompleteVendorData(vendorId);
// // //               if (!vendorData) {
// // //                 shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
// // //                 continue;
// // //               }

// // //               const vendorItems = vendorItemsMap[vendorId];
// // //               const result = await shiprocketService.createVendorShipment(
// // //                 order, vendorData, vendorItems, shippingAddress
// // //               );
// // //               shipmentResults.push(result);
// // //             } catch (vendorError) {
// // //               shipmentResults.push({ vendorId, success: false, error: vendorError.message });
// // //             }
// // //           }

// // //           const successfulShipments = shipmentResults.filter((r) => r.success);
// // //           order.shipments = successfulShipments.map((r) => ({
// // //             vendorId: r.vendorId,
// // //             company: r.company,
// // //             shipmentId: r.shipmentId,
// // //             orderId: r.orderId,
// // //             awbCode: r.awbCode,
// // //             labelUrl: r.labelUrl,
// // //             status: "created",
// // //             createdAt: new Date(),
// // //           }));

// // //           if (successfulShipments.length === shipmentResults.length) {
// // //             shiprocketSyncStatus = "synced";
// // //           } else if (successfulShipments.length > 0) {
// // //             shiprocketSyncStatus = "partial";
// // //           } else {
// // //             shiprocketSyncStatus = "failed";
// // //           }

// // //           order.shiprocketSyncStatus = shiprocketSyncStatus;
// // //           await order.save();
// // //         } else {
// // //           order.shiprocketSyncStatus = "skipped";
// // //           await order.save();
// // //         }
// // //       } else {
// // //         order.shiprocketSyncStatus = "disabled";
// // //         await order.save();
// // //       }
// // //     } catch (shiprocketError) {
// // //       order.shiprocketSyncStatus = "failed";
// // //       order.shiprocketError = shiprocketError.message;
// // //       await order.save();
// // //     }

// // //     // EMAILS
// // //     const emailResults = { customer: false, admin: false, vendors: [] };

// // //     const customerEmail = shippingAddress.email;
// // //     if (customerEmail && !isOnlinePayment) {
// // //       try {
// // //         const customerHtml = getCustomerOrderEmail(order, orderId);
// // //         const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// // //         emailResults.customer = result.success;
// // //       } catch (error) {
// // //         console.error("Error sending customer email:", error.message);
// // //       }
// // //     }

// // //     const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// // //     if (adminEmail) {
// // //       try {
// // //         const adminHtml = getAdminOrderEmail(order, orderId);
// // //         const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
// // //         emailResults.admin = result.success;
// // //       } catch (error) {
// // //         console.error("Error sending admin email:", error.message);
// // //       }
// // //     }

// // //     const vendorGroups = new Map();
// // //     for (const item of itemsWithVendorInfo) {
// // //       if (item.company && item.company !== "N/A") {
// // //         const company = item.company;
// // //         if (!vendorGroups.has(company)) {
// // //           vendorGroups.set(company, { company, items: [], vendorId: item.vendorId });
// // //         }
// // //         vendorGroups.get(company).items.push(item);
// // //       }
// // //     }

// // //     for (const [company, vendorData] of vendorGroups) {
// // //       try {
// // //         let vendor = await Vendor.findOne({ company }).select("email name company phone");
// // //         if (!vendor) {
// // //           vendor = await Vendor.findOne({
// // //             company: { $regex: new RegExp(`^${company}$`, "i") },
// // //           }).select("email name company phone");
// // //         }

// // //         if (vendor && vendor.email) {
// // //           const vendorHtml = getVendorOrderEmail(order, orderId, vendorData.items, {
// // //             name: vendor.name || company,
// // //             email: vendor.email,
// // //             shopName: company,
// // //             phone: vendor?.phone || "N/A",
// // //           });

// // //           const result = await sendEmail(
// // //             vendor.email,
// // //             `New Order Received for ${company} - Order #${orderId}`,
// // //             vendorHtml
// // //           );
// // //           emailResults.vendors.push({ company, email: vendor.email, success: result.success });
// // //         }
// // //       } catch (vendorErr) {
// // //         console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
// // //       }
// // //     }

// // //     // VENDOR NOTIFICATIONS
// // //     const notificationResults = [];
// // //     for (const [company, vendorData] of vendorGroups) {
// // //       try {
// // //         const vendorItems = vendorData.items;
// // //         const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

// // //         const notificationData = {
// // //           company,
// // //           title: "🛒 New Order Received!",
// // //           message: `You have received a new order #${orderId.toString().slice(-6)}.\n\nTotal Amount: ₹${vendorTotal}\nItems: ${vendorItems.length} product(s)\nCustomer: ${shippingAddress?.name || "Customer"}\nPhone: ${shippingAddress?.phone || "N/A"}\nOrder Date: ${new Date().toLocaleString()}\n\nPlease check and process the order.`,
// // //           read: false,
// // //           orderId: orderId,
// // //         };

// // //         await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
// // //           headers: { "Content-Type": "application/json" },
// // //           timeout: 5000,
// // //         });
// // //         notificationResults.push({ company, success: true });
// // //       } catch (vendorError) {
// // //         notificationResults.push({ company, success: false, error: vendorError.message });
// // //       }
// // //     }

// // //     // PAYU PARAMS
// // //     let payuParams = null;
// // //     if (isOnlinePayment) {
// // //       const txnid = `TXN_${Date.now()}_${order._id}`;
// // //       order.payuTxnId = txnid;
// // //       await order.save();

// // //       const cleanAmount = Number(order.totalPrice).toFixed(2);

// // //       const hashData = {
// // //         key: process.env.PAYU_KEY,
// // //         txnid: txnid,
// // //         amount: cleanAmount,
// // //         productinfo: "Order Payment",
// // //         firstname: shippingAddress.name,
// // //         email: shippingAddress.email,
// // //         salt: process.env.PAYU_SALT,
// // //       };

// // //       const hash = generatePayUHash(hashData);

// // //       payuParams = {
// // //         key: process.env.PAYU_KEY,
// // //         txnid: txnid,
// // //         amount: cleanAmount,
// // //         productinfo: "Order Payment",
// // //         firstname: shippingAddress.name,
// // //         email: shippingAddress.email,
// // //         phone: shippingAddress.phone,
// // //         surl: `${process.env.BACKEND_URL}/api/order/payu/success`,
// // //         furl: `${process.env.BACKEND_URL}/api/order/payu/failure`,
// // //         hash: hash,
// // //         service_provider: "payu_paisa",
// // //       };
// // //     }

// // //     res.json({
// // //       success: true,
// // //       message: "Order placed successfully",
// // //       orderId: order._id,
// // //       order: {
// // //         _id: order._id,
// // //         subtotal: order.subtotal,
// // //         totalPrice: order.totalPrice,
// // //         coupon: order.coupon,
// // //         discountApplied: order.coupon.discountAmount > 0,
// // //       },
// // //       payuParams: payuParams,
// // //       shipments: shipmentResults,
// // //       shiprocketSyncStatus: shiprocketSyncStatus,
// // //       emailResults: emailResults,
// // //       notificationResults: notificationResults,
// // //       vendorCount: vendorGroups.size,
// // //       emailMode: emailMode,
// // //     });
// // //   } catch (err) {
// // //     console.error("Order placement error:", err);
// // //     res.status(500).json({
// // //       success: false,
// // //       message: "Server error",
// // //       error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
// // //     });
// // //   }
// // // });

// // // // ============================================
// // // // PAYU SUCCESS CALLBACK
// // // // ============================================
// // // router.post("/payu/success", async (req, res) => {
// // //   try {
// // //     const responseData = req.body;

// // //     const isValid = verifyPayUHash({
// // //       ...responseData,
// // //       salt: process.env.PAYU_SALT,
// // //       key: process.env.PAYU_KEY,
// // //     });

// // //     if (!isValid) {
// // //       console.error("❌ PayU Hash verification failed");
// // //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// // //     }

// // //     const orderId = responseData.txnid.split("_")[2];

// // //     const order = await Order.findByIdAndUpdate(
// // //       orderId,
// // //       {
// // //         paymentStatus: "Paid",
// // //         payuPaymentId: responseData.mihpayid,
// // //         orderStatus: "Processing",
// // //       },
// // //       { new: true }
// // //     );

// // //     if (!order) {
// // //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // //     }

// // //     // ✅ Push to Shiprocket Logistics after payment
// // //     try {
// // //       await pushOrderToShiprocket(order);
// // //     } catch (pushErr) {
// // //       console.error("Shiprocket push error after PayU:", pushErr.message);
// // //     }

// // //     try {
// // //       const customerEmail = order.shippingAddress.email;
// // //       if (customerEmail) {
// // //         const customerHtml = getCustomerOrderEmail(order, orderId);
// // //         await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// // //       }
// // //     } catch (emailErr) {
// // //       console.error("Error sending post-payment email:", emailErr);
// // //     }

// // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=success&orderId=${orderId}`);
// // //   } catch (error) {
// // //     console.error("PayU Success Error:", error);
// // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // //   }
// // // });

// // // // ============================================
// // // // PAYU FAILURE CALLBACK
// // // // ============================================
// // // router.post("/payu/failure", async (req, res) => {
// // //   try {
// // //     const responseData = req.body;
// // //     const orderId = responseData.txnid ? responseData.txnid.split("_")[2] : null;

// // //     if (orderId) {
// // //       await Order.findByIdAndUpdate(orderId, {
// // //         paymentStatus: "Failed",
// // //         orderStatus: "Cancelled",
// // //       });
// // //     }

// // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// // //   } catch (error) {
// // //     console.error("PayU Failure Error:", error);
// // //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// // //   }
// // // });

// // // // ============================================
// // // // FASTrr STATUS CHECK
// // // // ============================================
// // // router.get("/fastrr-status/:productId", async (req, res) => {
// // //   try {
// // //     const product = await Product.findById(req.params.productId);
// // //     if (!product) return res.json({ synced: false, reason: "product_not_found" });

// // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
// // //     const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, {
// // //       timeout: 10000,
// // //     });
// // //     const apiProducts = apiRes.data?.data?.products || [];

// // //     const productName = (product.name || "").trim();
// // //     const normalizedDbName = normalizeString(productName);

// // //     const matched = apiProducts.find(
// // //       (p) => normalizeString(p.title) === normalizedDbName
// // //     );

// // //     res.json({
// // //       synced: !!matched,
// // //       productName,
// // //       matchedTitle: matched?.title || null,
// // //     });
// // //   } catch (err) {
// // //     console.error("Fastrr status check error:", err.message);
// // //     res.json({ synced: false, reason: "api_error", error: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // CHECK FASTRR COMPATIBILITY
// // // // ============================================
// // // router.post("/check-fastrr-compatibility", async (req, res) => {
// // //   try {
// // //     const { cartItems } = req.body;

// // //     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
// // //       return res.status(400).json({
// // //         compatible: false,
// // //         reason: "Cart is empty",
// // //       });
// // //     }

// // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// // //     let apiProducts = [];
// // //     try {
// // //       const apiRes = await axios.get(
// // //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// // //         { timeout: 10000 }
// // //       );
// // //       apiProducts = apiRes.data?.data?.products || [];
// // //       console.log(`📦 [Compat Check] Fetched ${apiProducts.length} Fastrr products`);
// // //     } catch (apiErr) {
// // //       console.error("❌ [Compat Check] Fastrr catalog fetch failed:", apiErr.message);
// // //       return res.status(500).json({
// // //         compatible: false,
// // //         reason: "Fastrr catalog service is currently unavailable. Please use standard checkout.",
// // //       });
// // //     }

// // //     for (const item of cartItems) {
// // //       let productName = (item.name || "").trim();

// // //       if (item.productId) {
// // //         try {
// // //           const product = await Product.findById(item.productId);
// // //           if (product) {
// // //             productName = (product.name || product.ProductName || productName).trim();
// // //           }
// // //         } catch (dbErr) {
// // //           console.warn(`[Compat Check] Product lookup failed for ${item.productId}:`, dbErr.message);
// // //         }
// // //       }

// // //       if (!productName) {
// // //         return res.json({
// // //           compatible: false,
// // //           reason: "Product name missing for compatibility check.",
// // //           productId: item.productId,
// // //         });
// // //       }

// // //       const lowerName = productName.toLowerCase();
// // //       const normalizedName = normalizeString(productName);

// // //       let matched = apiProducts.find(
// // //         (p) => (p.title || "").trim().toLowerCase() === lowerName
// // //       );

// // //       if (!matched) {
// // //         matched = apiProducts.find(
// // //           (p) => normalizeString(p.title) === normalizedName
// // //         );
// // //       }

// // //       if (!matched) {
// // //         console.warn(`⚠️ [Compat Check] "${productName}" NOT in Fastrr catalog`);
// // //         return res.json({
// // //           compatible: false,
// // //           reason: `"${productName}" is not yet available for Fastrr checkout.`,
// // //           productName,
// // //           productId: item.productId,
// // //         });
// // //       }

// // //       console.log(`✅ [Compat Check] Matched: "${matched.title}"`);
// // //     }

// // //     return res.json({ compatible: true });
// // //   } catch (error) {
// // //     console.error("Fastrr compatibility check error:", error.message);
// // //     return res.status(500).json({
// // //       compatible: false,
// // //       reason: "Compatibility check failed. Please use standard checkout.",
// // //       error: error.message,
// // //     });
// // //   }
// // // });

// // // // ============================================
// // // // FASTrr CHECKOUT — CREATE ORDER + ACCESS TOKEN
// // // // ============================================
// // // router.post("/shiprocket-checkout", async (req, res) => {
// // //   try {
// // //     const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

// // //     if (!guestId || !cartItems || cartItems.length === 0) {
// // //       return res.status(400).json({ success: false, message: "Invalid cart" });
// // //     }

// // //     if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
// // //       return res.status(400).json({ success: false, message: "Shipping address required" });
// // //     }

// // //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// // //     let apiProducts = [];
// // //     try {
// // //       const apiRes = await axios.get(
// // //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// // //         { timeout: 10000 }
// // //       );
// // //       apiProducts = apiRes.data?.data?.products || [];
// // //       console.log(`📦 Fetched ${apiProducts.length} products from /api/v2/products`);
// // //     } catch (apiErr) {
// // //       console.error("❌ Failed to fetch /api/v2/products:", apiErr.message);
// // //       return res.status(500).json({
// // //         success: false,
// // //         code: "FASTRR_CATALOG_UNAVAILABLE",
// // //         message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
// // //       });
// // //     }

// // //     const itemsWithVendorInfo = [];

// // //     for (const item of cartItems) {
// // //       const product = await Product.findById(item.productId).populate({
// // //         path: "vendorId",
// // //         select: "company name email _id",
// // //       });

// // //       if (!product) {
// // //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// // //       }

// // //       let effectiveStock = product.stock || 0;
// // //       let variantIdx = 0;
// // //       let variantDoc = null;

// // //       if (item.variantId && product.variants && product.variants.length > 0) {
// // //         variantDoc = product.variants.id(item.variantId);
// // //         if (!variantDoc) {
// // //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// // //         }
// // //         effectiveStock = variantDoc.stock || 0;
// // //         variantIdx = product.variants.findIndex(
// // //           (v) => v._id && v._id.toString() === item.variantId.toString()
// // //         );
// // //         if (variantIdx < 0) variantIdx = 0;
// // //       }

// // //       if (effectiveStock < item.quantity) {
// // //         return res.status(400).json({
// // //           success: false,
// // //           message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
// // //         });
// // //       }

// // //       let vendorId = null;
// // //       if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
// // //       else if (product.vendorId) vendorId = product.vendorId;
// // //       else if (product.vendor) vendorId = product.vendor;

// // //       const productName = (product.name || product.ProductName || "").trim();

// // //       console.log(`🔍 Looking for product in Fastrr catalog: "${productName}"`);

// // //       let matchedApiProduct = apiProducts.find((p) => {
// // //         const apiTitle = (p.title || "").trim().toLowerCase();
// // //         return apiTitle === productName.toLowerCase();
// // //       });

// // //       if (!matchedApiProduct) {
// // //         const normalizedDbName = normalizeString(productName);
// // //         matchedApiProduct = apiProducts.find(
// // //           (p) => normalizeString(p.title) === normalizedDbName
// // //         );
// // //       }

// // //       if (!matchedApiProduct) {
// // //         console.warn(`⚠️ Product "${productName}" NOT in Fastrr catalog.`);

// // //         return res.status(400).json({
// // //           success: false,
// // //           code: "FASTRR_CATALOG_MISSING",
// // //           message: `"${productName}" is not yet available for Fastrr checkout. Please use standard checkout (COD/PayU).`,
// // //           productName,
// // //           productId: item.productId,
// // //         });
// // //       }

// // //       console.log(`✅ Matched Fastrr product: "${matchedApiProduct.title}" (ID: ${matchedApiProduct.id})`);

// // //       let shiprocketVariantId = null;

// // //       if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
// // //         if (variantDoc) {
// // //           const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();

// // //           const matchedApiVariant = matchedApiProduct.variants.find((av) => {
// // //             const apiVariantTitle = (av.title || "").trim().toLowerCase();
// // //             return apiVariantTitle === variantTitle;
// // //           });

// // //           if (matchedApiVariant) {
// // //             shiprocketVariantId = matchedApiVariant.id;
// // //           } else {
// // //             shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
// // //               || matchedApiProduct.variants[0]?.id
// // //               || null;
// // //           }
// // //         } else {
// // //           shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
// // //         }
// // //       }

// // //       if (!shiprocketVariantId) {
// // //         return res.status(400).json({
// // //           success: false,
// // //           code: "FASTRR_VARIANT_MISSING",
// // //           message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
// // //           productName,
// // //           productId: item.productId,
// // //         });
// // //       }

// // //       itemsWithVendorInfo.push({
// // //         productId: item.productId,
// // //         variantId: item.variantId || null,
// // //         shiprocketVariantId,
// // //         name: item.name || product.name,
// // //         price: item.price || product.price,
// // //         quantity: item.quantity,
// // //         stock: effectiveStock,
// // //         image: Array.isArray(item.image) ? item.image : [item.image],
// // //         vendorId,
// // //         company: product.company || product.vendorId?.company || "N/A",
// // //         weight: product.weight || 0.5,
// // //         selectedColor: item.selectedColor || "",
// // //         selectedSize: item.selectedSize || "",
// // //         variantImage: item.variantImage || "",
// // //         variantPrice: item.variantPrice || 0,
// // //         customFieldLabel: item.customFieldLabel || null,
// // //         customFieldValue: item.customFieldValue || null,
// // //         sku: item.sku || "",
// // //       });
// // //     }

// // //     const order = new Order({
// // //       guestId,
// // //       items: itemsWithVendorInfo,
// // //       shippingAddress,
// // //       paymentMethod: "Shiprocket",
// // //       paymentStatus: "Pending",
// // //       subtotal,
// // //       totalPrice: total,
// // //       orderStatus: "Pending",
// // //       coupon: couponCode
// // //         ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
// // //         : { code: null, discountAmount: 0 },
// // //     });

// // //     await order.save();

// // //     const accessTokenPayload = {
// // //       cart_data: {
// // //         items: itemsWithVendorInfo.map((i) => ({
// // //           variant_id: String(i.shiprocketVariantId),
// // //           quantity: Number(i.quantity),
// // //         })),
// // //       },
// // //       redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`,
// // //       timestamp: new Date().toISOString(),
// // //     };

// // //     const payloadString = JSON.stringify(accessTokenPayload);

// // //     const hmac = crypto
// // //       .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
// // //       .update(payloadString)
// // //       .digest("base64");

// // //     console.log("🔑 Fastrr Access Token Request:");
// // //     console.log("Payload String:", payloadString);
// // //     console.log("HMAC:", hmac);
// // //     console.log("API Key:", process.env.SHIPROCKET_CHECKOUT_API_KEY);

// // //     let accessToken = null;
// // //     let shiprocketOrderId = null;

// // //     try {
// // //       const tokenResponse = await axios.post(
// // //         "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
// // //         payloadString,
// // //         {
// // //           headers: {
// // //             "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
// // //             "X-Api-HMAC-SHA256": hmac,
// // //             "Content-Type": "application/json",
// // //           },
// // //           timeout: 15000,
// // //         }
// // //       );

// // //       console.log("✅ Fastrr Access Token Response:", JSON.stringify(tokenResponse.data));

// // //       accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
// // //       shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
// // //         || tokenResponse.data?.result?.order_id
// // //         || tokenResponse.data?.order_id
// // //         || null;

// // //       if (shiprocketOrderId) {
// // //         order.shiprocketOrderId = shiprocketOrderId;
// // //         await order.save();
// // //       }
// // //     } catch (tokenErr) {
// // //       console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);

// // //       return res.status(500).json({
// // //         success: false,
// // //         message: "Failed to generate checkout token",
// // //         error: tokenErr.response?.data || tokenErr.message,
// // //       });
// // //     }

// // //     if (!accessToken) {
// // //       return res.status(500).json({
// // //         success: false,
// // //         message: "No access token received from Fastrr",
// // //       });
// // //     }

// // //     res.json({
// // //       success: true,
// // //       orderId: order._id,
// // //       accessToken,
// // //       shiprocketOrderId,
// // //     });
// // //   } catch (err) {
// // //     console.error("Shiprocket checkout create error:", err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // FASTrr CHECKOUT — ORDER WEBHOOK (REAL PAYLOAD)
// // // // Fastrr mokale: cart_id, latest_stage, paymentDetails.paymentMode, shipping_address
// // // // ============================================
// // // router.post("/shiprocket-webhook", async (req, res) => {
// // //   try {
// // //     console.log("📩 Fastrr Order Webhook received:", JSON.stringify(req.body, null, 2));

// // //     const {
// // //       cart_id,
// // //       latest_stage,
// // //       email,
// // //       phone_number,
// // //       first_name,
// // //       last_name,
// // //       total_price,
// // //       shipping_address,
// // //       billing_address,
// // //       paymentDetails,
// // //     } = req.body;

// // //     const rawPaymentMode = String(
// // //       paymentDetails?.paymentMode || ""
// // //     ).toLowerCase().trim();

// // //     const isCOD = rawPaymentMode === "cod";
// // //     const isPaid =
// // //       latest_stage === "ORDER_PLACED" &&
// // //       paymentDetails &&
// // //       ["upi", "card", "netbanking", "wallet", "prepaid"].includes(rawPaymentMode);

// // //     console.log(`💳 Payment detection → paymentMode: "${rawPaymentMode}", stage: "${latest_stage}", isCOD: ${isCOD}, isPaid: ${isPaid}`);

// // //     // ============================================================
// // //     // ✅ 4-STEP ORDER MATCHING
// // //     // ============================================================
// // //     let order = null;
// // //     let matchSource = null;

// // //     if (cart_id) {
// // //       order = await Order.findOne({ fastrrCartId: cart_id });
// // //       if (order) matchSource = "fastrrCartId";
// // //     }

// // //     if (!order && req.body.order_id) {
// // //       order = await Order.findOne({ shiprocketOrderId: req.body.order_id });
// // //       if (order) matchSource = "shiprocketOrderId";
// // //     }

// // //     if (!order && (email || phone_number)) {
// // //       const query = {
// // //         paymentMethod: "Shiprocket",
// // //         paymentStatus: "Pending",
// // //         orderStatus: { $ne: "Cancelled" },
// // //         createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
// // //       };
// // //       const orConditions = [];
// // //       if (email) orConditions.push({ "shippingAddress.email": email });
// // //       if (phone_number) orConditions.push({ "shippingAddress.phone": phone_number });
// // //       if (orConditions.length > 0) query.$or = orConditions;

// // //       order = await Order.findOne(query).sort({ createdAt: -1 });
// // //       if (order) matchSource = "email/phone";
// // //     }

// // //     if (!order) {
// // //       order = await Order.findOne({
// // //         paymentMethod: "Shiprocket",
// // //         paymentStatus: "Pending",
// // //         orderStatus: { $ne: "Cancelled" },
// // //         createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
// // //       }).sort({ createdAt: -1 });
// // //       if (order) matchSource = "recent-pending-fallback";
// // //     }

// // //     if (!order) {
// // //       console.warn("⚠️ No matching order found for webhook. cart_id:", cart_id);
// // //       return res.json({ success: true, message: "Order not found but webhook received" });
// // //     }

// // //     console.log(`✅ Order matched via ${matchSource}: ${order._id}`);

// // //     if (cart_id && !order.fastrrCartId) {
// // //       order.fastrrCartId = cart_id;
// // //     }

// // //     if (order.orderStatus === "Cancelled") {
// // //       console.log(`⚠️ Order ${order._id} already cancelled — skipping webhook`);
// // //       await order.save();
// // //       return res.json({ success: true, message: "Order already cancelled" });
// // //     }

// // //     // ============================================================
// // //     // ✅ BUILD REAL ADDRESS
// // //     // ============================================================
// // //     const buildAddressFromFastrr = (addr, fallbackEmail, fallbackPhone) => {
// // //       if (!addr) return null;
// // //       const fullName = `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || addr.name || "Customer";
// // //       return {
// // //         name: fullName,
// // //         email: fallbackEmail || order.shippingAddress?.email || "",
// // //         phone: addr.phone || fallbackPhone || order.shippingAddress?.phone || "",
// // //         address: [addr.address1, addr.address2].filter(Boolean).join(", ") || "Address not provided",
// // //         city: addr.city || "",
// // //         state: addr.state || "",
// // //         pincode: addr.zip || addr.pincode || "",
// // //         country: addr.country || "India",
// // //       };
// // //     };

// // //     const realShippingAddress = buildAddressFromFastrr(
// // //       shipping_address,
// // //       email,
// // //       phone_number
// // //     );

// // //     // ============================================================
// // //     // ✅ CASE 1: ORDER PLACED
// // //     // ============================================================
// // //     if (latest_stage === "ORDER_PLACED") {
// // //       console.log(`🟢 ORDER_PLACED detected — isCOD: ${isCOD}, isPaid: ${isPaid}`);

// // //       if (isCOD) {
// // //         order.paymentMethod = "COD";
// // //         order.paymentStatus = "Pending";
// // //       } else {
// // //         order.paymentMethod = rawPaymentMode
// // //           ? rawPaymentMode.charAt(0).toUpperCase() + rawPaymentMode.slice(1)
// // //           : "Prepaid";
// // //         order.paymentStatus = "Paid";
// // //         if (paymentDetails?.transactionId) {
// // //           order.shiprocketPaymentId = String(paymentDetails.transactionId);
// // //         }
// // //       }

// // //       order.orderStatus = "Processing";
// // //       order.totalPrice = total_price || order.totalPrice;

// // //       if (realShippingAddress) {
// // //         order.shippingAddress = realShippingAddress;
// // //         console.log(`✅ Real address updated: ${realShippingAddress.city} - ${realShippingAddress.pincode}`);
// // //       }

// // //       order.statusUpdatedAt = new Date();
// // //       order.statusUpdatedBy = null;
// // //       order.statusHistory = order.statusHistory || [];
// // //       order.statusHistory.push({
// // //         status: "Processing",
// // //         updatedAt: new Date(),
// // //         updatedBy: null,
// // //         note: isCOD
// // //           ? "COD order confirmed via Fastrr webhook"
// // //           : `Paid via ${order.paymentMethod} (Fastrr webhook)`,
// // //       });

// // //       await order.save();

// // //       // ✅ Decrement stock
// // //       for (const item of order.items) {
// // //         if (item.variantId) {
// // //           await Product.updateOne(
// // //             { _id: item.productId, "variants._id": item.variantId },
// // //             { $inc: { "variants.$.stock": -item.quantity } }
// // //           );
// // //         } else {
// // //           await Product.findByIdAndUpdate(item.productId, {
// // //             $inc: { stock: -item.quantity },
// // //           });
// // //         }
// // //       }

// // //       await Cart.findOneAndDelete({ guestId: order.guestId });

// // //       // ✅ SHIPROCKET LOGISTICS PUSH
// // //       await pushOrderToShiprocket(order);

// // //       // ✅ Send emails
// // //       try {
// // //         const customerEmail = order.shippingAddress?.email;
// // //         if (customerEmail) {
// // //           const html = getCustomerOrderEmail(order, order._id);
// // //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// // //         }
// // //       } catch (emailErr) {
// // //         console.error("Email error:", emailErr.message);
// // //       }

// // //       try {
// // //         const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// // //         if (adminEmail) {
// // //           const adminHtml = getAdminOrderEmail(order, order._id);
// // //           await sendEmail(adminEmail, `New Order (Fastrr) - #${order._id}`, adminHtml);
// // //         }
// // //       } catch (emailErr) {
// // //         console.error("Admin email error:", emailErr.message);
// // //       }

// // //       return res.json({
// // //         success: true,
// // //         orderId: order._id,
// // //         type: "ORDER_PLACED",
// // //         shiprocketSyncStatus: order.shiprocketSyncStatus,
// // //       });
// // //     }

// // //     // ============================================================
// // //     // ✅ CASE 2: PAYMENT_INITIATED
// // //     // ============================================================
// // //     if (latest_stage === "PAYMENT_INITIATED") {
// // //       console.log(`🟡 PAYMENT_INITIATED — saving real address, keeping order pending`);

// // //       if (realShippingAddress) {
// // //         order.shippingAddress = realShippingAddress;
// // //         console.log(`✅ Address saved (pending): ${realShippingAddress.city}`);
// // //       }

// // //       if (cart_id) order.fastrrCartId = cart_id;

// // //       await order.save();

// // //       return res.json({ success: true, orderId: order._id, type: "PAYMENT_INITIATED" });
// // //     }

// // //     // ============================================================
// // //     // ✅ CASE 3: INIT
// // //     // ============================================================
// // //     if (latest_stage === "INIT") {
// // //       console.log(`🔵 INIT — saving fastrrCartId for later matching`);

// // //       if (cart_id) order.fastrrCartId = cart_id;
// // //       await order.save();

// // //       return res.json({ success: true, orderId: order._id, type: "INIT" });
// // //     }

// // //     // ============================================================
// // //     // ✅ CASE 4: CANCELLED / FAILED
// // //     // ============================================================
// // //     if (latest_stage === "CANCELLED" || latest_stage === "FAILED") {
// // //       console.log(`🔴 ${latest_stage} — cancelling order`);

// // //       order.paymentStatus = "Failed";
// // //       order.orderStatus = "Cancelled";
// // //       order.statusUpdatedAt = new Date();
// // //       order.statusHistory = order.statusHistory || [];
// // //       order.statusHistory.push({
// // //         status: "Cancelled",
// // //         updatedAt: new Date(),
// // //         updatedBy: null,
// // //         note: `Auto-cancelled via Fastrr webhook (${latest_stage})`,
// // //       });

// // //       await order.save();
// // //       return res.json({ success: true, orderId: order._id, type: latest_stage });
// // //     }

// // //     console.log(`⚠️ Unknown latest_stage: ${latest_stage}`);
// // //     res.json({ success: true, orderId: order._id, type: "UNKNOWN_STAGE" });
// // //   } catch (err) {
// // //     console.error("Fastrr webhook error:", err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // FASTrr CHECKOUT — CONFIRM (from frontend)
// // // // ============================================
// // // router.post("/shiprocket-confirm", async (req, res) => {
// // //   try {
// // //     const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

// // //     if (!orderId) {
// // //       return res.status(400).json({ success: false, message: "orderId required" });
// // //     }

// // //     const order = await Order.findById(orderId);
// // //     if (!order) {
// // //       return res.status(404).json({ success: false, message: "Order not found" });
// // //     }

// // //     if (status === "success") {
// // //       order.paymentStatus = "Paid";
// // //       order.orderStatus = "Processing";
// // //       order.shiprocketPaymentId = shiprocketPaymentId || null;
// // //       order.shiprocketOrderId = shiprocketOrderId || null;

// // //       for (const item of order.items) {
// // //         if (item.variantId) {
// // //           await Product.updateOne(
// // //             { _id: item.productId, "variants._id": item.variantId },
// // //             { $inc: { "variants.$.stock": -item.quantity } }
// // //           );
// // //         } else {
// // //           await Product.findByIdAndUpdate(item.productId, {
// // //             $inc: { stock: -item.quantity },
// // //           });
// // //         }
// // //       }

// // //       await Cart.findOneAndDelete({ guestId: order.guestId });

// // //       // ✅ Push to Shiprocket
// // //       await pushOrderToShiprocket(order);

// // //       try {
// // //         const customerEmail = order.shippingAddress?.email;
// // //         if (customerEmail) {
// // //           const html = getCustomerOrderEmail(order, order._id);
// // //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// // //         }
// // //       } catch (emailErr) {
// // //         console.error("Email error:", emailErr.message);
// // //       }
// // //     } else {
// // //       order.paymentStatus = "Failed";
// // //       order.orderStatus = "Cancelled";
// // //     }

// // //     await order.save();
// // //     res.json({ success: true, order });
// // //   } catch (err) {
// // //     console.error("Confirm error:", err);
// // //     res.status(500).json({ success: false, message: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // GET SINGLE ORDER
// // // // ============================================
// // // router.get("/single/:orderId", async (req, res) => {
// // //   try {
// // //     const order = await Order.findById(req.params.orderId);
// // //     if (!order) return res.status(404).json({ message: "Order not found" });
// // //     res.json(order);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // });

// // // // ============================================
// // // // ✅ GET ORDERS BY GUEST — FILTERED
// // // // ============================================
// // // router.get("/guest/:guestId", async (req, res) => {
// // //   try {
// // //     const filter = getVisibleOrdersFilter({ guestId: req.params.guestId });
// // //     const orders = await Order.find(filter).sort({ createdAt: -1 });

// // //     console.log(`📋 Guest orders for ${req.params.guestId}: ${orders.length} visible`);

// // //     res.json(orders);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // });

// // // // ============================================
// // // // ✅ GET USER ORDERS — FILTERED
// // // // ============================================
// // // router.get("/user/:userId", async (req, res) => {
// // //   try {
// // //     const filter = getVisibleOrdersFilter({ userId: req.params.userId });
// // //     const orders = await Order.find(filter).sort({ createdAt: -1 });

// // //     console.log(`📋 User orders for ${req.params.userId}: ${orders.length} visible`);

// // //     res.json(orders);
// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // });

// // // // ============================================
// // // // ADMIN: GET ORDER WITH COMMISSION
// // // // ============================================
// // // router.get("/admin/commission/:orderId", async (req, res) => {
// // //   try {
// // //     const order = await Order.findById(req.params.orderId);
// // //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// // //     let totalAdminCommission = 0;
// // //     let totalVendorCommission = 0;
// // //     const vendorBreakdown = {};

// // //     for (const item of order.items) {
// // //       if (item.vendorId) {
// // //         const vendorIdStr = item.vendorId.toString();
// // //         const vendor = await Vendor.findById(item.vendorId).populate("planId");

// // //         let commissionPercentage = 8;
// // //         if (vendor && vendor.planId) {
// // //           commissionPercentage = vendor.planId.commissionPercentage || 8;
// // //         }

// // //         const itemTotal = item.price * item.quantity;
// // //         const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // //         const adminCommission = itemTotal - vendorCommission;

// // //         totalVendorCommission += vendorCommission;
// // //         totalAdminCommission += adminCommission;

// // //         if (!vendorBreakdown[vendorIdStr]) {
// // //           vendorBreakdown[vendorIdStr] = {
// // //             company: item.company || "Unknown",
// // //             vendorId: item.vendorId,
// // //             vendorName: vendor?.name || "Unknown",
// // //             vendorEmail: vendor?.email || "N/A",
// // //             commissionPercentage: commissionPercentage,
// // //             items: [],
// // //             totalItemValue: 0,
// // //             totalVendorCommission: 0,
// // //             totalAdminCommission: 0,
// // //           };
// // //         }

// // //         vendorBreakdown[vendorIdStr].items.push({
// // //           name: item.name,
// // //           price: item.price,
// // //           quantity: item.quantity,
// // //           total: itemTotal,
// // //           vendorCommission: vendorCommission,
// // //           adminCommission: adminCommission,
// // //           selectedColor: item.selectedColor || "",
// // //           selectedSize: item.selectedSize || "",
// // //           variantImage: item.variantImage || "",
// // //           customFieldLabel: item.customFieldLabel || null,
// // //           customFieldValue: item.customFieldValue || null,
// // //         });

// // //         vendorBreakdown[vendorIdStr].totalItemValue += itemTotal;
// // //         vendorBreakdown[vendorIdStr].totalVendorCommission += vendorCommission;
// // //         vendorBreakdown[vendorIdStr].totalAdminCommission += adminCommission;
// // //       }
// // //     }

// // //     res.json({
// // //       success: true,
// // //       orderId: order._id,
// // //       orderStatus: order.orderStatus,
// // //       paymentStatus: order.paymentStatus,
// // //       subtotal: order.subtotal || order.totalPrice,
// // //       totalPrice: order.totalPrice,
// // //       coupon: order.coupon || null,
// // //       createdAt: order.createdAt,
// // //       shippingAddress: order.shippingAddress,
// // //       paymentMethod: order.paymentMethod,
// // //       shipments: order.shipments || [],
// // //       shiprocketSyncStatus: order.shiprocketSyncStatus,
// // //       shiprocketError: order.shiprocketError || null,
// // //       commissionSummary: {
// // //         totalAdminCommission,
// // //         totalVendorCommission,
// // //         platformCommissionRate:
// // //           order.totalPrice > 0
// // //             ? ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // //             : "0%",
// // //         vendorCommissionRate:
// // //           order.totalPrice > 0
// // //             ? ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // //             : "0%",
// // //       },
// // //       vendorBreakdown: Object.values(vendorBreakdown),
// // //     });
// // //   } catch (err) {
// // //     console.error("Commission view error:", err);
// // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // ADMIN: GET ALL ORDERS WITH COMMISSIONS
// // // // ============================================
// // // router.get("/admin/commissions", async (req, res) => {
// // //   try {
// // //     const { startDate, endDate, vendorId, status } = req.query;
// // //     let filter = {};
// // //     if (startDate && endDate) {
// // //       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
// // //     }
// // //     if (status) filter.orderStatus = status;

// // //     const orders = await Order.find(filter).sort({ createdAt: -1 });
// // //     const orderSummaries = [];
// // //     let totalAdminCommission = 0;
// // //     let totalVendorCommission = 0;
// // //     let totalRevenue = 0;

// // //     for (const order of orders) {
// // //       let orderAdminCommission = 0;
// // //       let orderVendorCommission = 0;
// // //       const vendorSet = new Set();

// // //       for (const item of order.items) {
// // //         if (item.vendorId) {
// // //           vendorSet.add(item.vendorId.toString());
// // //           const vendor = await Vendor.findById(item.vendorId).populate("planId");
// // //           let commissionPercentage = 8;
// // //           if (vendor && vendor.planId) {
// // //             commissionPercentage = vendor.planId.commissionPercentage || 8;
// // //           }
// // //           const itemTotal = item.price * item.quantity;
// // //           const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // //           const adminCommission = itemTotal - vendorCommission;
// // //           orderVendorCommission += vendorCommission;
// // //           orderAdminCommission += adminCommission;
// // //         }
// // //       }

// // //       totalAdminCommission += orderAdminCommission;
// // //       totalVendorCommission += orderVendorCommission;
// // //       totalRevenue += order.totalPrice || 0;

// // //       orderSummaries.push({
// // //         _id: order._id,
// // //         subtotal: order.subtotal || order.totalPrice,
// // //         totalPrice: order.totalPrice,
// // //         coupon: order.coupon || null,
// // //         orderStatus: order.orderStatus,
// // //         paymentStatus: order.paymentStatus,
// // //         createdAt: order.createdAt,
// // //         vendorCount: vendorSet.size,
// // //         shipmentCount: order.shipments?.length || 0,
// // //         shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// // //         adminCommission: orderAdminCommission,
// // //         vendorCommission: orderVendorCommission,
// // //         platformCommissionRate:
// // //           order.totalPrice > 0
// // //             ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // //             : "0%",
// // //       });
// // //     }

// // //     let filteredSummaries = orderSummaries;
// // //     if (vendorId) {
// // //       const filteredOrders = await Order.find({ ...filter, "items.vendorId": vendorId }).sort({ createdAt: -1 });
// // //       const filteredResults = [];
// // //       let filteredAdminCommission = 0;
// // //       let filteredVendorCommission = 0;
// // //       let filteredRevenue = 0;

// // //       for (const order of filteredOrders) {
// // //         let orderAdminCommission = 0;
// // //         let orderVendorCommission = 0;
// // //         const vendorSet = new Set();

// // //         for (const item of order.items) {
// // //           if (item.vendorId && item.vendorId.toString() === vendorId) {
// // //             vendorSet.add(item.vendorId.toString());
// // //             const vendor = await Vendor.findById(item.vendorId).populate("planId");
// // //             let commissionPercentage = 8;
// // //             if (vendor && vendor.planId) {
// // //               commissionPercentage = vendor.planId.commissionPercentage || 8;
// // //             }
// // //             const itemTotal = item.price * item.quantity;
// // //             const vendorCommission = (itemTotal * commissionPercentage) / 100;
// // //             const adminCommission = itemTotal - vendorCommission;
// // //             orderVendorCommission += vendorCommission;
// // //             orderAdminCommission += adminCommission;
// // //           }
// // //         }

// // //         filteredAdminCommission += orderAdminCommission;
// // //         filteredVendorCommission += orderVendorCommission;
// // //         filteredRevenue += order.totalPrice || 0;

// // //         filteredResults.push({
// // //           _id: order._id,
// // //           subtotal: order.subtotal || order.totalPrice,
// // //           totalPrice: order.totalPrice,
// // //           coupon: order.coupon || null,
// // //           orderStatus: order.orderStatus,
// // //           paymentStatus: order.paymentStatus,
// // //           createdAt: order.createdAt,
// // //           vendorCount: vendorSet.size,
// // //           shipmentCount: order.shipments?.length || 0,
// // //           shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// // //           adminCommission: orderAdminCommission,
// // //           vendorCommission: orderVendorCommission,
// // //           platformCommissionRate:
// // //             order.totalPrice > 0
// // //               ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// // //               : "0%",
// // //         });
// // //       }

// // //       filteredSummaries = filteredResults;
// // //       totalAdminCommission = filteredAdminCommission;
// // //       totalVendorCommission = filteredVendorCommission;
// // //       totalRevenue = filteredRevenue;
// // //     }

// // //     res.json({
// // //       success: true,
// // //       summary: {
// // //         totalOrders: filteredSummaries.length,
// // //         totalRevenue,
// // //         totalAdminCommission,
// // //         totalVendorCommission,
// // //         platformCommissionRate:
// // //           totalRevenue > 0
// // //             ? ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + "%"
// // //             : "0%",
// // //       },
// // //       orders: filteredSummaries,
// // //     });
// // //   } catch (err) {
// // //     console.error("Admin commissions fetch error:", err);
// // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // ADMIN: UPDATE ORDER STATUS
// // // // ============================================
// // // router.put("/admin/status/:orderId", async (req, res) => {
// // //   try {
// // //     const { status } = req.body;
// // //     const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// // //     if (!validStatuses.includes(status)) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
// // //       });
// // //     }

// // //     const order = await Order.findByIdAndUpdate(
// // //       req.params.orderId,
// // //       { orderStatus: status },
// // //       { new: true }
// // //     );

// // //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// // //     res.json({
// // //       success: true,
// // //       message: "Order status updated successfully",
// // //       order: {
// // //         _id: order._id,
// // //         orderStatus: order.orderStatus,
// // //         updatedAt: order.updatedAt,
// // //         shipments: order.shipments || [],
// // //         shiprocketSyncStatus: order.shiprocketSyncStatus,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("Order status update error:", err);
// // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // //   }
// // // });

// // // // ============================================
// // // // SEND ORDER CONFIRMATION EMAIL (Manual)
// // // // ============================================
// // // router.post("/send-confirmation", async (req, res) => {
// // //   try {
// // //     const {
// // //       to, subject, orderId, customerName, items, subtotal,
// // //       couponDiscount, shippingCost, total, paymentMethod, orderDate,
// // //     } = req.body;

// // //     if (!to) return res.status(400).json({ success: false, message: "Recipient email is required" });

// // //     const html = `
// // //       <!DOCTYPE html>
// // //       <html><head><meta charset="UTF-8"><style>
// // //         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
// // //         .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; }
// // //         .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
// // //         .header h1 { color: #fff; margin: 0; }
// // //         .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
// // //         .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
// // //         .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
// // //         .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
// // //       </style></head>
// // //       <body><div class="container">
// // //         <div class="header"><h1>🎉 Order Confirmed!</h1><p>Thank you, ${customerName || "Customer"}!</p></div>
// // //         <div style="padding: 20px;">
// // //           <p><strong>📋 Order #:</strong> ${orderId}</p>
// // //           <p><strong>📅 Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
// // //           <p><strong>💳 Payment:</strong> ${paymentMethod || "COD"}</p>
// // //           <h3>🛍️ Order Items</h3>
// // //           <table class="items-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
// // //           <tbody>${(items || []).map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("")}</tbody></table>
// // //           <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
// // //             <div><span>Subtotal</span><span style="float:right;">₹${(subtotal || 0).toFixed(2)}</span></div>
// // //             ${couponDiscount > 0 ? `<div style="color:#28a745;"><span>Discount</span><span style="float:right;">-₹${(couponDiscount || 0).toFixed(2)}</span></div>` : ""}
// // //             <div><span>Shipping</span><span style="float:right;">${shippingCost === 0 ? "FREE" : `₹${(shippingCost || 0).toFixed(2)}`}</span></div>
// // //             <div style="font-size:20px; font-weight:bold; border-top:2px solid #28a745; margin-top:10px; padding-top:10px;"><span>Total</span><span style="float:right; color:#28a745;">₹${(total || 0).toFixed(2)}</span></div>
// // //           </div>
// // //           <div class="footer"><p>Thank you for shopping with us! 🛍️</p></div>
// // //         </div>
// // //       </div></body></html>`;

// // //     const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);
// // //     if (result.success) {
// // //       res.json({ success: true, message: "Email sent successfully" });
// // //     } else {
// // //       res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
// // //     }
// // //   } catch (err) {
// // //     console.error("Send confirmation error:", err);
// // //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// // //   }
// // // });

// // // module.exports = router;

// // // Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT + AUTO SHIPROCKET PUSH + AUTO AWB
// // // ✅ FIX: COD orders always visible, Fastrr/Shiprocket orders visible only after payment
// // // ✅ FIX: Pending placeholder Fastrr orders HIDDEN (with real email/phone filter)
// // // ✅ FIX: Cancelled orders hidden from order list
// // // ✅ FIX: Real Fastrr payload detection (cart_id, latest_stage, paymentDetails)
// // // ✅ FIX: 4-step order matching
// // // ✅ FIX: Real address from Fastrr webhook
// // // ✅ FIX: Auto push to Shiprocket Logistics on ORDER_PLACED
// // // ✅ FIX: Auto AWB assign + label generation
// // const express = require("express");
// // const router = express.Router();
// // const mongoose = require("mongoose");
// // const crypto = require("crypto");
// // const Order = require("../Models/Order");
// // const Cart = require("../Models/Cart");
// // const Vendor = require("../Models/Vendor");
// // const SellerDocument = require("../Models/SellerDocument");
// // const Product = require("../Models/Product");
// // const Coupon = require("../Models/Coupon");
// // const axios = require("axios");
// // const {
// //   sendEmail,
// //   getCustomerOrderEmail,
// //   getAdminOrderEmail,
// //   getVendorOrderEmail,
// //   emailMode,
// // } = require("../Comfig/emailConfig");

// // const shiprocketService = require("../utils/shiprocketService");

// // const VENDOR_API_URL =
// //   process.env.VENDOR_API_URL ||
// //   "https://api.brandelvendor.starlighttechlabsindia.com/api";

// // // ============================================
// // // HELPER: Order visibility filter
// // // ✅ COD orders always visible
// // // ✅ Paid orders visible
// // // ✅ Pending placeholder Fastrr orders HIDDEN
// // // ✅ Cancelled orders HIDDEN
// // // ============================================
// // const getVisibleOrdersFilter = (extraFilter = {}) => {
// //   return {
// //     ...extraFilter,
// //     // ❌ Cancelled orders hide
// //     orderStatus: { $nin: ["Cancelled"] },
// //     // ❌ Placeholder emails/phones hide + only show COD/Paid
// //     $and: [
// //       {
// //         $or: [
// //           { "shippingAddress.email": { $ne: "pending@fastrr-checkout.com" } },
// //           { "shippingAddress.email": { $exists: false } },
// //         ],
// //       },
// //       {
// //         $or: [
// //           // ✅ COD orders always visible
// //           {
// //             paymentMethod: {
// //               $in: [
// //                 "COD",
// //                 "cod",
// //                 "Cod",
// //                 "Cash on Delivery",
// //                 "cash on delivery",
// //                 "cash_on_delivery",
// //               ],
// //             },
// //           },
// //           // ✅ Paid orders visible
// //           { paymentStatus: "Paid" },
// //         ],
// //       },
// //     ],
// //   };
// // };

// // // ============================================
// // // HELPER: Detect placeholder addresses
// // // ============================================
// // const isPlaceholderAddress = (addr) => {
// //   if (!addr) return true;
// //   const a = String(addr.address || "").toLowerCase();
// //   const e = String(addr.email || "").toLowerCase();
// //   const p = String(addr.phone || "");
// //   return (
// //     !a ||
// //     a.includes("pending") ||
// //     a.includes("will be provided") ||
// //     a.includes("will be captured") ||
// //     e === "pending@fastrr-checkout.com" ||
// //     e === "guest@native91.com" ||
// //     p === "0000000000" ||
// //     p === "9999999999"
// //   );
// // };

// // // ============================================
// // // PAYU HELPER FUNCTIONS
// // // ============================================
// // const generatePayUHash = (data) => {
// //   const { key, txnid, amount, productinfo, firstname, email, salt } = data;
// //   const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
// //   console.log("🔑 PayU Hash String:", hashString);
// //   return crypto.createHash("sha512").update(hashString).digest("hex");
// // };

// // const verifyPayUHash = (data) => {
// //   const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

// //   let hashString;
// //   if (additionalCharges) {
// //     hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// //   } else {
// //     hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
// //   }

// //   const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
// //   console.log("🔐 Reverse Hash Calculated:", calculatedHash);
// //   console.log("🔐 Reverse Hash Received  :", hash);
// //   return calculatedHash === hash;
// // };

// // // ============================================
// // // HELPER: Get complete vendor data
// // // ============================================
// // async function getCompleteVendorData(vendorId) {
// //   try {
// //     const vendor = await Vendor.findById(vendorId);
// //     if (!vendor) return null;

// //     const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

// //     return {
// //       _id: vendor._id,
// //       name: vendor.name || vendor.company,
// //       company: vendor.company || "N/A",
// //       email: vendor.email,
// //       phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
// //       address: sellerDoc?.contact?.address || "Default Address",
// //       city: sellerDoc?.contact?.city || "Mumbai",
// //       state: sellerDoc?.contact?.state || "Maharashtra",
// //       pincode: sellerDoc?.contact?.pincode || "400001",
// //       country: sellerDoc?.contact?.country || "India",
// //     };
// //   } catch (error) {
// //     console.error("Error fetching vendor data:", error.message);
// //     return null;
// //   }
// // }

// // // ============================================
// // // HELPER: Normalize string for matching
// // // ============================================
// // const normalizeString = (s) =>
// //   (s || "")
// //     .toString()
// //     .trim()
// //     .toLowerCase()
// //     .replace(/[^\w\s]/g, "")
// //     .replace(/\s+/g, " ");

// // // ============================================
// // // HELPER: Push order to Shiprocket Logistics
// // // ✅ Auto push + Auto AWB assign + Auto label
// // // ============================================
// // async function pushOrderToShiprocket(order) {
// //   try {
// //     if (process.env.SHIPROCKET_ENABLED !== "true") {
// //       console.log("ℹ️ Shiprocket disabled — skipping push");
// //       order.shiprocketSyncStatus = "disabled";
// //       await order.save();
// //       return;
// //     }

// //     console.log(`🚀 Pushing order ${order._id} to Shiprocket Logistics...`);

// //     // Group items by vendor
// //     const vendorItemsMap = {};
// //     for (const item of order.items) {
// //       const vid = item.vendorId?.toString();
// //       if (!vid) continue;
// //       if (!vendorItemsMap[vid]) vendorItemsMap[vid] = [];
// //       vendorItemsMap[vid].push(item);
// //     }

// //     const vendorIds = Object.keys(vendorItemsMap);

// //     if (vendorIds.length === 0) {
// //       console.warn("⚠️ No vendor IDs found — skipping Shiprocket push");
// //       order.shiprocketSyncStatus = "skipped";
// //       order.shiprocketError = "No vendor IDs found in items";
// //       await order.save();
// //       return;
// //     }

// //     const shipmentResults = [];

// //     for (const vendorId of vendorIds) {
// //       try {
// //         const vendorData = await getCompleteVendorData(vendorId);
// //         if (!vendorData) {
// //           console.warn(`⚠️ Vendor not found: ${vendorId}`);
// //           shipmentResults.push({
// //             vendorId,
// //             success: false,
// //             error: "Vendor not found",
// //           });
// //           continue;
// //         }

// //         const vendorItems = vendorItemsMap[vendorId];

// //         const result = await shiprocketService.createVendorShipment(
// //           order,
// //           vendorData,
// //           vendorItems,
// //           order.shippingAddress
// //         );

// //         shipmentResults.push(result);

// //         if (result.success) {
// //           console.log(
// //             `✅ Shipment created for ${vendorData.company}: ${result.shipmentId}`
// //           );
// //         } else {
// //           console.error(
// //             `❌ Shipment failed for ${vendorData.company}: ${result.error}`
// //           );
// //         }
// //       } catch (vendorErr) {
// //         console.error(`❌ Vendor shipment error (${vendorId}):`, vendorErr.message);
// //         shipmentResults.push({
// //           vendorId,
// //           success: false,
// //           error: vendorErr.message,
// //         });
// //       }
// //     }

// //     const successfulShipments = shipmentResults.filter((r) => r.success);

// //     // ============================================================
// //     // ✅ NEW: Assign AWB for each shipment
// //     // ============================================================
// //     const shipmentsWithAWB = [];

// //     for (const r of successfulShipments) {
// //       let awbCode = r.awbCode || "UNKNOWN";
// //       let labelUrl = r.labelUrl || "";

// //       // Try to assign AWB if not already assigned
// //       if (r.shipmentId && r.shipmentId !== "UNKNOWN" && awbCode === "UNKNOWN") {
// //         try {
// //           console.log(`🚚 Assigning AWB for shipment: ${r.shipmentId}`);
// //           const awbResult = await shiprocketService.assignAWB(r.shipmentId);

// //           if (awbResult.success) {
// //             awbCode = awbResult.awbCode || "UNKNOWN";
// //             console.log(`✅ AWB assigned: ${awbCode}`);

// //             // Try to generate label
// //             try {
// //               const labelResult = await shiprocketService.generateLabel(r.shipmentId);
// //               if (labelResult.success) {
// //                 labelUrl = labelResult.labelUrl || "";
// //                 console.log(`✅ Label generated: ${labelUrl}`);
// //               }
// //             } catch (labelErr) {
// //               console.warn(`⚠️ Label generation failed: ${labelErr.message}`);
// //             }
// //           } else {
// //             console.warn(`⚠️ AWB assignment failed: ${awbResult.error}`);
// //           }
// //         } catch (awbErr) {
// //           console.error(`❌ AWB assign error: ${awbErr.message}`);
// //         }
// //       }

// //       shipmentsWithAWB.push({
// //         vendorId: r.vendorId,
// //         company: r.company,
// //         shipmentId: r.shipmentId,
// //         orderId: r.orderId,
// //         awbCode: awbCode,
// //         labelUrl: labelUrl,
// //         status: "created",
// //         createdAt: new Date(),
// //       });
// //     }

// //     order.shipments = shipmentsWithAWB;

// //     if (successfulShipments.length === shipmentResults.length) {
// //       order.shiprocketSyncStatus = "synced";
// //     } else if (successfulShipments.length > 0) {
// //       order.shiprocketSyncStatus = "partial";
// //     } else {
// //       order.shiprocketSyncStatus = "failed";
// //     }

// //     await order.save();

// //     console.log(
// //       `📦 Shiprocket sync: ${successfulShipments.length}/${shipmentResults.length} — status: ${order.shiprocketSyncStatus}`
// //     );
// //   } catch (err) {
// //     console.error("❌ Shiprocket push error:", err.message);
// //     order.shiprocketSyncStatus = "failed";
// //     order.shiprocketError = err.message;
// //     await order.save();
// //   }
// // }

// // // ============================================
// // // PLACE ORDER (Standard COD/PayU)
// // // ============================================
// // router.post("/place", async (req, res) => {
// //   const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

// //   if (!guestId || !shippingAddress) {
// //     return res.status(400).json({ success: false, message: "Incomplete data" });
// //   }

// //   try {
// //     const cart = await Cart.findOne({ guestId });
// //     if (!cart || cart.items.length === 0) {
// //       return res.status(400).json({ success: false, message: "Cart is empty" });
// //     }

// //     const itemsWithVendorInfo = await Promise.all(
// //       cart.items.map(async (item) => {
// //         const product = await Product.findById(item.productId).populate({
// //           path: "vendorId",
// //           select: "company name email _id",
// //         });

// //         let company = null;
// //         let vendorId = null;

// //         if (product?.vendorId) {
// //           if (product.vendorId._id) vendorId = product.vendorId._id;
// //           else vendorId = product.vendorId;
// //         }
// //         if (!vendorId && product?.vendor) vendorId = product.vendor;
// //         if (!vendorId && item.company) {
// //           const vendorByCompany = await Vendor.findOne({
// //             company: { $regex: new RegExp(`^${item.company}$`, "i") },
// //           });
// //           if (vendorByCompany) vendorId = vendorByCompany._id;
// //         }

// //         if (product && product.company) company = product.company;
// //         else if (product && product.vendorId && product.vendorId.company)
// //           company = product.vendorId.company;
// //         else if (product && product.vendor) {
// //           const vendorDoc = await Vendor.findById(product.vendor);
// //           if (vendorDoc && vendorDoc.company) company = vendorDoc.company;
// //         }
// //         if (!company && vendorId) {
// //           const vendor = await Vendor.findById(vendorId);
// //           if (vendor && vendor.company) company = vendor.company;
// //         }
// //         if (!company && item.company) company = item.company;

// //         const variantImage = item.variantImage || null;
// //         const variantPrice = item.variantPrice || 0;
// //         const customFieldLabel = item.customFieldLabel || null;
// //         const customFieldValue = item.customFieldValue || null;

// //         return {
// //           productId: item.productId,
// //           name: item.name || product?.name || "Unknown Product",
// //           price: item.price || product?.price || 0,
// //           quantity: item.quantity || 1,
// //           stock: product?.stock || 0,
// //           image: variantImage
// //             ? variantImage
// //             : Array.isArray(item.image)
// //               ? item.image[0]
// //               : item.image || product?.image?.[0] || null,
// //           vendorId: vendorId,
// //           company: company || "N/A",
// //           weight: product?.weight || 0.5,
// //           variantId: item.variantId || null,
// //           selectedColor: item.selectedColor || "",
// //           selectedSize: item.selectedSize || "",
// //           variantImage: item.variantImage || "",
// //           variantPrice: variantPrice,
// //           customFieldLabel: customFieldLabel,
// //           customFieldValue: customFieldValue,
// //         };
// //       })
// //     );

// //     // Stock validation
// //     for (const item of itemsWithVendorInfo) {
// //       const product = await Product.findById(item.productId);
// //       if (!product) {
// //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// //       }

// //       if (item.variantId && product.variants && product.variants.length > 0) {
// //         const variant = product.variants.id(item.variantId);
// //         if (!variant) {
// //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// //         }
// //         if (variant.stock < item.quantity) {
// //           return res.status(400).json({
// //             success: false,
// //             message: `Insufficient stock for ${product.name}. Available: ${variant.stock}`,
// //           });
// //         }
// //       } else {
// //         if (product.stock < item.quantity) {
// //           return res.status(400).json({
// //             success: false,
// //             message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
// //           });
// //         }
// //       }
// //     }

// //     let subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
// //     let totalPrice = subtotal;
// //     let couponData = {
// //       code: null,
// //       discountType: null,
// //       discountValue: 0,
// //       discountAmount: 0,
// //       couponId: null,
// //     };

// //     if (couponCode) {
// //       try {
// //         const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

// //         if (coupon) {
// //           const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
// //           const usageLimitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
// //           const minOrderNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

// //           if (!isExpired && !usageLimitReached && !minOrderNotMet) {
// //             let discountAmount = 0;

// //             if (coupon.discountType === "percentage") {
// //               discountAmount = (subtotal * coupon.discountValue) / 100;
// //               if (coupon.maxDiscountAmount) {
// //                 discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
// //               }
// //             } else {
// //               discountAmount = Math.min(coupon.discountValue, subtotal);
// //             }

// //             totalPrice = subtotal - discountAmount;

// //             couponData = {
// //               code: coupon.code,
// //               discountType: coupon.discountType,
// //               discountValue: coupon.discountValue,
// //               discountAmount: Number(discountAmount.toFixed(2)),
// //               couponId: coupon._id,
// //             };

// //             coupon.usageCount = (coupon.usageCount || 0) + 1;
// //             await coupon.save();
// //           }
// //         }
// //       } catch (couponError) {
// //         console.error("Coupon validation error:", couponError);
// //       }
// //     }

// //     const isOnlinePayment =
// //       paymentMethod === "PayU" || paymentMethod === "Online" ||
// //       paymentMethod === "upi" || paymentMethod === "card";

// //     const order = new Order({
// //       guestId,
// //       items: itemsWithVendorInfo.map((item) => ({
// //         productId: item.productId,
// //         name: item.name,
// //         price: item.price,
// //         quantity: item.quantity,
// //         stockAtPurchase: item.stock,
// //         image: item.image ? [item.image] : [],
// //         vendorId: item.vendorId,
// //         company: item.company,
// //         weight: item.weight || 0.5,
// //         variantId: item.variantId || null,
// //         selectedColor: item.selectedColor || "",
// //         selectedSize: item.selectedSize || "",
// //         variantImage: item.variantImage || "",
// //         variantPrice: item.variantPrice || 0,
// //         customFieldLabel: item.customFieldLabel || null,
// //         customFieldValue: item.customFieldValue || null,
// //       })),
// //       shippingAddress,
// //       paymentMethod: paymentMethod || "COD",
// //       paymentStatus: "Pending",
// //       subtotal: subtotal,
// //       totalPrice: totalPrice,
// //       coupon: couponData,
// //       orderStatus: "Pending",
// //     });

// //     await order.save();

// //     for (const item of itemsWithVendorInfo) {
// //       if (item.variantId) {
// //         await Product.updateOne(
// //           { _id: item.productId, "variants._id": item.variantId },
// //           { $inc: { "variants.$.stock": -item.quantity } }
// //         );
// //       } else {
// //         await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
// //       }
// //     }

// //     await Cart.findOneAndDelete({ guestId });

// //     const orderId = order._id;

// //     // SHIPROCKET INTEGRATION
// //     let shipmentResults = [];
// //     let shiprocketSyncStatus = "pending";

// //     try {
// //       if (process.env.SHIPROCKET_ENABLED === "true") {
// //         const vendorItemsMap = {};

// //         for (const item of itemsWithVendorInfo) {
// //           if (item.vendorId) {
// //             const vendorId = item.vendorId.toString();
// //             if (!vendorItemsMap[vendorId]) vendorItemsMap[vendorId] = [];
// //             vendorItemsMap[vendorId].push({ ...item, weight: item.weight || 0.5 });
// //           }
// //         }

// //         const vendorIds = Object.keys(vendorItemsMap);

// //         if (vendorIds.length > 0) {
// //           for (const vendorId of vendorIds) {
// //             try {
// //               const vendorData = await getCompleteVendorData(vendorId);
// //               if (!vendorData) {
// //                 shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
// //                 continue;
// //               }

// //               const vendorItems = vendorItemsMap[vendorId];
// //               const result = await shiprocketService.createVendorShipment(
// //                 order, vendorData, vendorItems, shippingAddress
// //               );
// //               shipmentResults.push(result);
// //             } catch (vendorError) {
// //               shipmentResults.push({ vendorId, success: false, error: vendorError.message });
// //             }
// //           }

// //           const successfulShipments = shipmentResults.filter((r) => r.success);

// //           // ✅ Auto assign AWB for each shipment
// //           const shipmentsWithAWB = [];
// //           for (const r of successfulShipments) {
// //             let awbCode = r.awbCode || "UNKNOWN";
// //             let labelUrl = r.labelUrl || "";

// //             if (r.shipmentId && r.shipmentId !== "UNKNOWN" && awbCode === "UNKNOWN") {
// //               try {
// //                 console.log(`🚚 Assigning AWB for shipment: ${r.shipmentId}`);
// //                 const awbResult = await shiprocketService.assignAWB(r.shipmentId);

// //                 if (awbResult.success) {
// //                   awbCode = awbResult.awbCode || "UNKNOWN";
// //                   console.log(`✅ AWB assigned: ${awbCode}`);

// //                   try {
// //                     const labelResult = await shiprocketService.generateLabel(r.shipmentId);
// //                     if (labelResult.success) {
// //                       labelUrl = labelResult.labelUrl || "";
// //                     }
// //                   } catch (labelErr) {
// //                     console.warn(`⚠️ Label generation failed: ${labelErr.message}`);
// //                   }
// //                 }
// //               } catch (awbErr) {
// //                 console.error(`❌ AWB assign error: ${awbErr.message}`);
// //               }
// //             }

// //             shipmentsWithAWB.push({
// //               vendorId: r.vendorId,
// //               company: r.company,
// //               shipmentId: r.shipmentId,
// //               orderId: r.orderId,
// //               awbCode: awbCode,
// //               labelUrl: labelUrl,
// //               status: "created",
// //               createdAt: new Date(),
// //             });
// //           }

// //           order.shipments = shipmentsWithAWB;

// //           if (successfulShipments.length === shipmentResults.length) {
// //             shiprocketSyncStatus = "synced";
// //           } else if (successfulShipments.length > 0) {
// //             shiprocketSyncStatus = "partial";
// //           } else {
// //             shiprocketSyncStatus = "failed";
// //           }

// //           order.shiprocketSyncStatus = shiprocketSyncStatus;
// //           await order.save();
// //         } else {
// //           order.shiprocketSyncStatus = "skipped";
// //           await order.save();
// //         }
// //       } else {
// //         order.shiprocketSyncStatus = "disabled";
// //         await order.save();
// //       }
// //     } catch (shiprocketError) {
// //       order.shiprocketSyncStatus = "failed";
// //       order.shiprocketError = shiprocketError.message;
// //       await order.save();
// //     }

// //     // EMAILS
// //     const emailResults = { customer: false, admin: false, vendors: [] };

// //     const customerEmail = shippingAddress.email;
// //     if (customerEmail && !isOnlinePayment) {
// //       try {
// //         const customerHtml = getCustomerOrderEmail(order, orderId);
// //         const result = await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// //         emailResults.customer = result.success;
// //       } catch (error) {
// //         console.error("Error sending customer email:", error.message);
// //       }
// //     }

// //     const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// //     if (adminEmail) {
// //       try {
// //         const adminHtml = getAdminOrderEmail(order, orderId);
// //         const result = await sendEmail(adminEmail, `New Order Received - Order #${orderId}`, adminHtml);
// //         emailResults.admin = result.success;
// //       } catch (error) {
// //         console.error("Error sending admin email:", error.message);
// //       }
// //     }

// //     const vendorGroups = new Map();
// //     for (const item of itemsWithVendorInfo) {
// //       if (item.company && item.company !== "N/A") {
// //         const company = item.company;
// //         if (!vendorGroups.has(company)) {
// //           vendorGroups.set(company, { company, items: [], vendorId: item.vendorId });
// //         }
// //         vendorGroups.get(company).items.push(item);
// //       }
// //     }

// //     for (const [company, vendorData] of vendorGroups) {
// //       try {
// //         let vendor = await Vendor.findOne({ company }).select("email name company phone");
// //         if (!vendor) {
// //           vendor = await Vendor.findOne({
// //             company: { $regex: new RegExp(`^${company}$`, "i") },
// //           }).select("email name company phone");
// //         }

// //         if (vendor && vendor.email) {
// //           const vendorHtml = getVendorOrderEmail(order, orderId, vendorData.items, {
// //             name: vendor.name || company,
// //             email: vendor.email,
// //             shopName: company,
// //             phone: vendor?.phone || "N/A",
// //           });

// //           const result = await sendEmail(
// //             vendor.email,
// //             `New Order Received for ${company} - Order #${orderId}`,
// //             vendorHtml
// //           );
// //           emailResults.vendors.push({ company, email: vendor.email, success: result.success });
// //         }
// //       } catch (vendorErr) {
// //         console.error(`Error sending email to vendor ${company}:`, vendorErr.message);
// //       }
// //     }

// //     // VENDOR NOTIFICATIONS
// //     const notificationResults = [];
// //     for (const [company, vendorData] of vendorGroups) {
// //       try {
// //         const vendorItems = vendorData.items;
// //         const vendorTotal = vendorItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

// //         const notificationData = {
// //           company,
// //           title: "🛒 New Order Received!",
// //           message: `You have received a new order #${orderId.toString().slice(-6)}.\n\nTotal Amount: ₹${vendorTotal}\nItems: ${vendorItems.length} product(s)\nCustomer: ${shippingAddress?.name || "Customer"}\nPhone: ${shippingAddress?.phone || "N/A"}\nOrder Date: ${new Date().toLocaleString()}\n\nPlease check and process the order.`,
// //           read: false,
// //           orderId: orderId,
// //         };

// //         await axios.post(`${VENDOR_API_URL}/notifications/create`, notificationData, {
// //           headers: { "Content-Type": "application/json" },
// //           timeout: 5000,
// //         });
// //         notificationResults.push({ company, success: true });
// //       } catch (vendorError) {
// //         notificationResults.push({ company, success: false, error: vendorError.message });
// //       }
// //     }

// //     // PAYU PARAMS
// //     let payuParams = null;
// //     if (isOnlinePayment) {
// //       const txnid = `TXN_${Date.now()}_${order._id}`;
// //       order.payuTxnId = txnid;
// //       await order.save();

// //       const cleanAmount = Number(order.totalPrice).toFixed(2);

// //       const hashData = {
// //         key: process.env.PAYU_KEY,
// //         txnid: txnid,
// //         amount: cleanAmount,
// //         productinfo: "Order Payment",
// //         firstname: shippingAddress.name,
// //         email: shippingAddress.email,
// //         salt: process.env.PAYU_SALT,
// //       };

// //       const hash = generatePayUHash(hashData);

// //       payuParams = {
// //         key: process.env.PAYU_KEY,
// //         txnid: txnid,
// //         amount: cleanAmount,
// //         productinfo: "Order Payment",
// //         firstname: shippingAddress.name,
// //         email: shippingAddress.email,
// //         phone: shippingAddress.phone,
// //         surl: `${process.env.BACKEND_URL}/api/order/payu/success`,
// //         furl: `${process.env.BACKEND_URL}/api/order/payu/failure`,
// //         hash: hash,
// //         service_provider: "payu_paisa",
// //       };
// //     }

// //     res.json({
// //       success: true,
// //       message: "Order placed successfully",
// //       orderId: order._id,
// //       order: {
// //         _id: order._id,
// //         subtotal: order.subtotal,
// //         totalPrice: order.totalPrice,
// //         coupon: order.coupon,
// //         discountApplied: order.coupon.discountAmount > 0,
// //       },
// //       payuParams: payuParams,
// //       shipments: shipmentResults,
// //       shiprocketSyncStatus: shiprocketSyncStatus,
// //       emailResults: emailResults,
// //       notificationResults: notificationResults,
// //       vendorCount: vendorGroups.size,
// //       emailMode: emailMode,
// //     });
// //   } catch (err) {
// //     console.error("Order placement error:", err);
// //     res.status(500).json({
// //       success: false,
// //       message: "Server error",
// //       error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
// //     });
// //   }
// // });

// // // ============================================
// // // PAYU SUCCESS CALLBACK
// // // ============================================
// // router.post("/payu/success", async (req, res) => {
// //   try {
// //     const responseData = req.body;

// //     const isValid = verifyPayUHash({
// //       ...responseData,
// //       salt: process.env.PAYU_SALT,
// //       key: process.env.PAYU_KEY,
// //     });

// //     if (!isValid) {
// //       console.error("❌ PayU Hash verification failed");
// //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// //     }

// //     const orderId = responseData.txnid.split("_")[2];

// //     const order = await Order.findByIdAndUpdate(
// //       orderId,
// //       {
// //         paymentStatus: "Paid",
// //         payuPaymentId: responseData.mihpayid,
// //         orderStatus: "Processing",
// //       },
// //       { new: true }
// //     );

// //     if (!order) {
// //       return res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// //     }

// //     // ✅ Push to Shiprocket Logistics after payment
// //     try {
// //       await pushOrderToShiprocket(order);
// //     } catch (pushErr) {
// //       console.error("Shiprocket push error after PayU:", pushErr.message);
// //     }

// //     try {
// //       const customerEmail = order.shippingAddress.email;
// //       if (customerEmail) {
// //         const customerHtml = getCustomerOrderEmail(order, orderId);
// //         await sendEmail(customerEmail, `Order Confirmed! - Order #${orderId}`, customerHtml);
// //       }
// //     } catch (emailErr) {
// //       console.error("Error sending post-payment email:", emailErr);
// //     }

// //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=success&orderId=${orderId}`);
// //   } catch (error) {
// //     console.error("PayU Success Error:", error);
// //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// //   }
// // });

// // // ============================================
// // // PAYU FAILURE CALLBACK
// // // ============================================
// // router.post("/payu/failure", async (req, res) => {
// //   try {
// //     const responseData = req.body;
// //     const orderId = responseData.txnid ? responseData.txnid.split("_")[2] : null;

// //     if (orderId) {
// //       await Order.findByIdAndUpdate(orderId, {
// //         paymentStatus: "Failed",
// //         orderStatus: "Cancelled",
// //       });
// //     }

// //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=failed`);
// //   } catch (error) {
// //     console.error("PayU Failure Error:", error);
// //     res.redirect(`${process.env.FRONTEND_URL}/order-complete?status=error`);
// //   }
// // });

// // // ============================================
// // // FASTrr STATUS CHECK
// // // ============================================
// // router.get("/fastrr-status/:productId", async (req, res) => {
// //   try {
// //     const product = await Product.findById(req.params.productId);
// //     if (!product) return res.json({ synced: false, reason: "product_not_found" });

// //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
// //     const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, {
// //       timeout: 10000,
// //     });
// //     const apiProducts = apiRes.data?.data?.products || [];

// //     const productName = (product.name || "").trim();
// //     const normalizedDbName = normalizeString(productName);

// //     const matched = apiProducts.find(
// //       (p) => normalizeString(p.title) === normalizedDbName
// //     );

// //     res.json({
// //       synced: !!matched,
// //       productName,
// //       matchedTitle: matched?.title || null,
// //     });
// //   } catch (err) {
// //     console.error("Fastrr status check error:", err.message);
// //     res.json({ synced: false, reason: "api_error", error: err.message });
// //   }
// // });

// // // ============================================
// // // CHECK FASTRR COMPATIBILITY
// // // ============================================
// // router.post("/check-fastrr-compatibility", async (req, res) => {
// //   try {
// //     const { cartItems } = req.body;

// //     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
// //       return res.status(400).json({
// //         compatible: false,
// //         reason: "Cart is empty",
// //       });
// //     }

// //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// //     let apiProducts = [];
// //     try {
// //       const apiRes = await axios.get(
// //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// //         { timeout: 10000 }
// //       );
// //       apiProducts = apiRes.data?.data?.products || [];
// //       console.log(`📦 [Compat Check] Fetched ${apiProducts.length} Fastrr products`);
// //     } catch (apiErr) {
// //       console.error("❌ [Compat Check] Fastrr catalog fetch failed:", apiErr.message);
// //       return res.status(500).json({
// //         compatible: false,
// //         reason: "Fastrr catalog service is currently unavailable. Please use standard checkout.",
// //       });
// //     }

// //     for (const item of cartItems) {
// //       let productName = (item.name || "").trim();

// //       if (item.productId) {
// //         try {
// //           const product = await Product.findById(item.productId);
// //           if (product) {
// //             productName = (product.name || product.ProductName || productName).trim();
// //           }
// //         } catch (dbErr) {
// //           console.warn(`[Compat Check] Product lookup failed for ${item.productId}:`, dbErr.message);
// //         }
// //       }

// //       if (!productName) {
// //         return res.json({
// //           compatible: false,
// //           reason: "Product name missing for compatibility check.",
// //           productId: item.productId,
// //         });
// //       }

// //       const lowerName = productName.toLowerCase();
// //       const normalizedName = normalizeString(productName);

// //       let matched = apiProducts.find(
// //         (p) => (p.title || "").trim().toLowerCase() === lowerName
// //       );

// //       if (!matched) {
// //         matched = apiProducts.find(
// //           (p) => normalizeString(p.title) === normalizedName
// //         );
// //       }

// //       if (!matched) {
// //         console.warn(`⚠️ [Compat Check] "${productName}" NOT in Fastrr catalog`);
// //         return res.json({
// //           compatible: false,
// //           reason: `"${productName}" is not yet available for Fastrr checkout.`,
// //           productName,
// //           productId: item.productId,
// //         });
// //       }

// //       console.log(`✅ [Compat Check] Matched: "${matched.title}"`);
// //     }

// //     return res.json({ compatible: true });
// //   } catch (error) {
// //     console.error("Fastrr compatibility check error:", error.message);
// //     return res.status(500).json({
// //       compatible: false,
// //       reason: "Compatibility check failed. Please use standard checkout.",
// //       error: error.message,
// //     });
// //   }
// // });

// // // ============================================
// // // FASTrr CHECKOUT — CREATE ORDER + ACCESS TOKEN
// // // ============================================
// // router.post("/shiprocket-checkout", async (req, res) => {
// //   try {
// //     const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

// //     if (!guestId || !cartItems || cartItems.length === 0) {
// //       return res.status(400).json({ success: false, message: "Invalid cart" });
// //     }

// //     if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
// //       return res.status(400).json({ success: false, message: "Shipping address required" });
// //     }

// //     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

// //     let apiProducts = [];
// //     try {
// //       const apiRes = await axios.get(
// //         `${BASE_URL}/api/v2/products?page=1&limit=500`,
// //         { timeout: 10000 }
// //       );
// //       apiProducts = apiRes.data?.data?.products || [];
// //       console.log(`📦 Fetched ${apiProducts.length} products from /api/v2/products`);
// //     } catch (apiErr) {
// //       console.error("❌ Failed to fetch /api/v2/products:", apiErr.message);
// //       return res.status(500).json({
// //         success: false,
// //         code: "FASTRR_CATALOG_UNAVAILABLE",
// //         message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
// //       });
// //     }

// //     const itemsWithVendorInfo = [];

// //     for (const item of cartItems) {
// //       const product = await Product.findById(item.productId).populate({
// //         path: "vendorId",
// //         select: "company name email _id",
// //       });

// //       if (!product) {
// //         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
// //       }

// //       let effectiveStock = product.stock || 0;
// //       let variantIdx = 0;
// //       let variantDoc = null;

// //       if (item.variantId && product.variants && product.variants.length > 0) {
// //         variantDoc = product.variants.id(item.variantId);
// //         if (!variantDoc) {
// //           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
// //         }
// //         effectiveStock = variantDoc.stock || 0;
// //         variantIdx = product.variants.findIndex(
// //           (v) => v._id && v._id.toString() === item.variantId.toString()
// //         );
// //         if (variantIdx < 0) variantIdx = 0;
// //       }

// //       if (effectiveStock < item.quantity) {
// //         return res.status(400).json({
// //           success: false,
// //           message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
// //         });
// //       }

// //       let vendorId = null;
// //       if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
// //       else if (product.vendorId) vendorId = product.vendorId;
// //       else if (product.vendor) vendorId = product.vendor;

// //       const productName = (product.name || product.ProductName || "").trim();

// //       console.log(`🔍 Looking for product in Fastrr catalog: "${productName}"`);

// //       let matchedApiProduct = apiProducts.find((p) => {
// //         const apiTitle = (p.title || "").trim().toLowerCase();
// //         return apiTitle === productName.toLowerCase();
// //       });

// //       if (!matchedApiProduct) {
// //         const normalizedDbName = normalizeString(productName);
// //         matchedApiProduct = apiProducts.find(
// //           (p) => normalizeString(p.title) === normalizedDbName
// //         );
// //       }

// //       if (!matchedApiProduct) {
// //         console.warn(`⚠️ Product "${productName}" NOT in Fastrr catalog.`);

// //         return res.status(400).json({
// //           success: false,
// //           code: "FASTRR_CATALOG_MISSING",
// //           message: `"${productName}" is not yet available for Fastrr checkout. Please use standard checkout (COD/PayU).`,
// //           productName,
// //           productId: item.productId,
// //         });
// //       }

// //       console.log(`✅ Matched Fastrr product: "${matchedApiProduct.title}" (ID: ${matchedApiProduct.id})`);

// //       let shiprocketVariantId = null;

// //       if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
// //         if (variantDoc) {
// //           const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();

// //           const matchedApiVariant = matchedApiProduct.variants.find((av) => {
// //             const apiVariantTitle = (av.title || "").trim().toLowerCase();
// //             return apiVariantTitle === variantTitle;
// //           });

// //           if (matchedApiVariant) {
// //             shiprocketVariantId = matchedApiVariant.id;
// //           } else {
// //             shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
// //               || matchedApiProduct.variants[0]?.id
// //               || null;
// //           }
// //         } else {
// //           shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
// //         }
// //       }

// //       if (!shiprocketVariantId) {
// //         return res.status(400).json({
// //           success: false,
// //           code: "FASTRR_VARIANT_MISSING",
// //           message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
// //           productName,
// //           productId: item.productId,
// //         });
// //       }

// //       itemsWithVendorInfo.push({
// //         productId: item.productId,
// //         variantId: item.variantId || null,
// //         shiprocketVariantId,
// //         name: item.name || product.name,
// //         price: item.price || product.price,
// //         quantity: item.quantity,
// //         stock: effectiveStock,
// //         image: Array.isArray(item.image) ? item.image : [item.image],
// //         vendorId,
// //         company: product.company || product.vendorId?.company || "N/A",
// //         weight: product.weight || 0.5,
// //         selectedColor: item.selectedColor || "",
// //         selectedSize: item.selectedSize || "",
// //         variantImage: item.variantImage || "",
// //         variantPrice: item.variantPrice || 0,
// //         customFieldLabel: item.customFieldLabel || null,
// //         customFieldValue: item.customFieldValue || null,
// //         sku: item.sku || "",
// //       });
// //     }

// //     const order = new Order({
// //       guestId,
// //       items: itemsWithVendorInfo,
// //       shippingAddress,
// //       paymentMethod: "Shiprocket",
// //       paymentStatus: "Pending",
// //       subtotal,
// //       totalPrice: total,
// //       orderStatus: "Pending",
// //       coupon: couponCode
// //         ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
// //         : { code: null, discountAmount: 0 },
// //     });

// //     await order.save();

// //     const accessTokenPayload = {
// //       cart_data: {
// //         items: itemsWithVendorInfo.map((i) => ({
// //           variant_id: String(i.shiprocketVariantId),
// //           quantity: Number(i.quantity),
// //         })),
// //       },
// //       redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`,
// //       timestamp: new Date().toISOString(),
// //     };

// //     const payloadString = JSON.stringify(accessTokenPayload);

// //     const hmac = crypto
// //       .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
// //       .update(payloadString)
// //       .digest("base64");

// //     console.log("🔑 Fastrr Access Token Request:");
// //     console.log("Payload String:", payloadString);
// //     console.log("HMAC:", hmac);
// //     console.log("API Key:", process.env.SHIPROCKET_CHECKOUT_API_KEY);

// //     let accessToken = null;
// //     let shiprocketOrderId = null;

// //     try {
// //       const tokenResponse = await axios.post(
// //         "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
// //         payloadString,
// //         {
// //           headers: {
// //             "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
// //             "X-Api-HMAC-SHA256": hmac,
// //             "Content-Type": "application/json",
// //           },
// //           timeout: 15000,
// //         }
// //       );

// //       console.log("✅ Fastrr Access Token Response:", JSON.stringify(tokenResponse.data));
// //       accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
// //       shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
// //         || tokenResponse.data?.result?.order_id
// //         || tokenResponse.data?.order_id
// //         || null;

// //       // ✅ ALSO extract cart_id from token response
// //       const fastrrCartId =
// //         tokenResponse.data?.result?.data?.cart_id ||
// //         tokenResponse.data?.result?.cart_id ||
// //         tokenResponse.data?.cart_id ||
// //         null;

// //       console.log(`🔍 Extracted from token → orderId: ${shiprocketOrderId}, cartId: ${fastrrCartId}`);

// //       if (shiprocketOrderId) {
// //         order.shiprocketOrderId = shiprocketOrderId;
// //         if (fastrrCartId) {
// //           order.fastrrCartId = fastrrCartId;   // ✅ ALSO save
// //         }
// //         await order.save();
// //         console.log(`✅ Order saved: shiprocketOrderId=${shiprocketOrderId}, fastrrCartId=${fastrrCartId || '(none)'}`);
// //       }
// //     } catch (tokenErr) {
// //       console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);

// //       return res.status(500).json({
// //         success: false,
// //         message: "Failed to generate checkout token",
// //         error: tokenErr.response?.data || tokenErr.message,
// //       });
// //     }

// //     if (!accessToken) {
// //       return res.status(500).json({
// //         success: false,
// //         message: "No access token received from Fastrr",
// //       });
// //     }

// //    res.json({
// //   success: true,
// //   orderId: order._id,
// //   accessToken,
// //   shiprocketOrderId,
// //   fastrrCartId: order.fastrrCartId,   // ✅ Return both
// // });
// //   } catch (err) {
// //     console.error("Shiprocket checkout create error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // ============================================
// // // FASTrr CHECKOUT — ORDER WEBHOOK (REAL PAYLOAD)
// // // ============================================
// // router.post("/shiprocket-webhook", async (req, res) => {
// //   try {
// //     console.log("📩 Fastrr Order Webhook received:", JSON.stringify(req.body, null, 2));

// //     const {
// //       cart_id,
// //       latest_stage,
// //       email,
// //       phone_number,
// //       first_name,
// //       last_name,
// //       total_price,
// //       shipping_address,
// //       billing_address,
// //       paymentDetails,
// //     } = req.body;

// //     const rawPaymentMode = String(
// //       paymentDetails?.paymentMode || ""
// //     ).toLowerCase().trim();

// //     const isCOD = rawPaymentMode === "cod";
// //     const isPaid =
// //       latest_stage === "ORDER_PLACED" &&
// //       paymentDetails &&
// //       ["upi", "card", "netbanking", "wallet", "prepaid"].includes(rawPaymentMode);

// //     console.log(`💳 Payment detection → paymentMode: "${rawPaymentMode}", stage: "${latest_stage}", isCOD: ${isCOD}, isPaid: ${isPaid}`);

// //     // ============================================================
// //     // ✅ 4-STEP ORDER MATCHING
// //     // ============================================================
// //     let order = null;
// //     let matchSource = null;

// //     if (cart_id) {
// //       order = await Order.findOne({ fastrrCartId: cart_id });
// //       if (order) matchSource = "fastrrCartId";
// //     }

// //     if (!order && req.body.order_id) {
// //       order = await Order.findOne({ shiprocketOrderId: req.body.order_id });
// //       if (order) matchSource = "shiprocketOrderId";
// //     }

// //     if (!order && (email || phone_number)) {
// //       const query = {
// //         paymentMethod: "Shiprocket",
// //         paymentStatus: "Pending",
// //         orderStatus: { $ne: "Cancelled" },
// //         createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
// //       };
// //       const orConditions = [];
// //       if (email) orConditions.push({ "shippingAddress.email": email });
// //       if (phone_number) orConditions.push({ "shippingAddress.phone": phone_number });
// //       if (orConditions.length > 0) query.$or = orConditions;

// //       order = await Order.findOne(query).sort({ createdAt: -1 });
// //       if (order) matchSource = "email/phone";
// //     }

// //     if (!order) {
// //       order = await Order.findOne({
// //         paymentMethod: "Shiprocket",
// //         paymentStatus: "Pending",
// //         orderStatus: { $ne: "Cancelled" },
// //         createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
// //       }).sort({ createdAt: -1 });
// //       if (order) matchSource = "recent-pending-fallback";
// //     }

// //     if (!order) {
// //       console.warn("⚠️ No matching order found for webhook. cart_id:", cart_id);
// //       return res.json({ success: true, message: "Order not found but webhook received" });
// //     }

// //     console.log(`✅ Order matched via ${matchSource}: ${order._id}`);

// //     if (cart_id && !order.fastrrCartId) {
// //       order.fastrrCartId = cart_id;
// //     }

// //     if (order.orderStatus === "Cancelled") {
// //       console.log(`⚠️ Order ${order._id} already cancelled — skipping webhook`);
// //       await order.save();
// //       return res.json({ success: true, message: "Order already cancelled" });
// //     }

// //     // ============================================================
// //     // ✅ BUILD REAL ADDRESS
// //     // ============================================================
// //     const buildAddressFromFastrr = (addr, fallbackEmail, fallbackPhone) => {
// //       if (!addr) return null;
// //       const fullName = `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || addr.name || "Customer";
// //       return {
// //         name: fullName,
// //         email: fallbackEmail || order.shippingAddress?.email || "",
// //         phone: addr.phone || fallbackPhone || order.shippingAddress?.phone || "",
// //         address: [addr.address1, addr.address2].filter(Boolean).join(", ") || "Address not provided",
// //         city: addr.city || "",
// //         state: addr.state || "",
// //         pincode: addr.zip || addr.pincode || "",
// //         country: addr.country || "India",
// //       };
// //     };

// //     const realShippingAddress = buildAddressFromFastrr(
// //       shipping_address,
// //       email,
// //       phone_number
// //     );

// //     // ============================================================
// //     // ✅ CASE 1: ORDER PLACED
// //     // ============================================================
// //     if (latest_stage === "ORDER_PLACED") {
// //       console.log(`🟢 ORDER_PLACED detected — isCOD: ${isCOD}, isPaid: ${isPaid}`);

// //       if (isCOD) {
// //         order.paymentMethod = "COD";
// //         order.paymentStatus = "Pending";
// //       } else {
// //         order.paymentMethod = rawPaymentMode
// //           ? rawPaymentMode.charAt(0).toUpperCase() + rawPaymentMode.slice(1)
// //           : "Prepaid";
// //         order.paymentStatus = "Paid";
// //         if (paymentDetails?.transactionId) {
// //           order.shiprocketPaymentId = String(paymentDetails.transactionId);
// //         }
// //       }

// //       order.orderStatus = "Processing";
// //       order.totalPrice = total_price || order.totalPrice;

// //       if (realShippingAddress) {
// //         order.shippingAddress = realShippingAddress;
// //         console.log(`✅ Real address updated: ${realShippingAddress.city} - ${realShippingAddress.pincode}`);
// //       }

// //       order.statusUpdatedAt = new Date();
// //       order.statusUpdatedBy = null;
// //       order.statusHistory = order.statusHistory || [];
// //       order.statusHistory.push({
// //         status: "Processing",
// //         updatedAt: new Date(),
// //         updatedBy: null,
// //         note: isCOD
// //           ? "COD order confirmed via Fastrr webhook"
// //           : `Paid via ${order.paymentMethod} (Fastrr webhook)`,
// //       });

// //       await order.save();

// //       // ✅ Decrement stock
// //       for (const item of order.items) {
// //         if (item.variantId) {
// //           await Product.updateOne(
// //             { _id: item.productId, "variants._id": item.variantId },
// //             { $inc: { "variants.$.stock": -item.quantity } }
// //           );
// //         } else {
// //           await Product.findByIdAndUpdate(item.productId, {
// //             $inc: { stock: -item.quantity },
// //           });
// //         }
// //       }

// //       await Cart.findOneAndDelete({ guestId: order.guestId });

// //       // ✅ SHIPROCKET LOGISTICS PUSH (with auto AWB)
// //       await pushOrderToShiprocket(order);

// //       // ✅ Send emails
// //       try {
// //         const customerEmail = order.shippingAddress?.email;
// //         if (customerEmail) {
// //           const html = getCustomerOrderEmail(order, order._id);
// //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// //         }
// //       } catch (emailErr) {
// //         console.error("Email error:", emailErr.message);
// //       }

// //       try {
// //         const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
// //         if (adminEmail) {
// //           const adminHtml = getAdminOrderEmail(order, order._id);
// //           await sendEmail(adminEmail, `New Order (Fastrr) - #${order._id}`, adminHtml);
// //         }
// //       } catch (emailErr) {
// //         console.error("Admin email error:", emailErr.message);
// //       }

// //       return res.json({
// //         success: true,
// //         orderId: order._id,
// //         type: "ORDER_PLACED",
// //         shiprocketSyncStatus: order.shiprocketSyncStatus,
// //       });
// //     }

// //     // ============================================================
// //     // ✅ CASE 2: PAYMENT_INITIATED
// //     // ============================================================
// //     if (latest_stage === "PAYMENT_INITIATED") {
// //       console.log(`🟡 PAYMENT_INITIATED — saving real address, keeping order pending`);

// //       if (realShippingAddress) {
// //         order.shippingAddress = realShippingAddress;
// //         console.log(`✅ Address saved (pending): ${realShippingAddress.city}`);
// //       }

// //       if (cart_id) order.fastrrCartId = cart_id;

// //       await order.save();

// //       return res.json({ success: true, orderId: order._id, type: "PAYMENT_INITIATED" });
// //     }

// //     // ============================================================
// //     // ✅ CASE 3: INIT
// //     // ============================================================
// //     if (latest_stage === "INIT") {
// //       console.log(`🔵 INIT — saving fastrrCartId for later matching`);

// //       if (cart_id) order.fastrrCartId = cart_id;
// //       await order.save();

// //       return res.json({ success: true, orderId: order._id, type: "INIT" });
// //     }

// //     // ============================================================
// //     // ✅ CASE 4: CANCELLED / FAILED
// //     // ============================================================
// //     if (latest_stage === "CANCELLED" || latest_stage === "FAILED") {
// //       console.log(`🔴 ${latest_stage} — cancelling order`);

// //       order.paymentStatus = "Failed";
// //       order.orderStatus = "Cancelled";
// //       order.statusUpdatedAt = new Date();
// //       order.statusHistory = order.statusHistory || [];
// //       order.statusHistory.push({
// //         status: "Cancelled",
// //         updatedAt: new Date(),
// //         updatedBy: null,
// //         note: `Auto-cancelled via Fastrr webhook (${latest_stage})`,
// //       });

// //       await order.save();
// //       return res.json({ success: true, orderId: order._id, type: latest_stage });
// //     }

// //     console.log(`⚠️ Unknown latest_stage: ${latest_stage}`);
// //     res.json({ success: true, orderId: order._id, type: "UNKNOWN_STAGE" });
// //   } catch (err) {
// //     console.error("Fastrr webhook error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // ============================================
// // // FASTrr CHECKOUT — CONFIRM (from frontend)
// // // ============================================
// // router.post("/shiprocket-confirm", async (req, res) => {
// //   try {
// //     const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

// //     if (!orderId) {
// //       return res.status(400).json({ success: false, message: "orderId required" });
// //     }

// //     const order = await Order.findById(orderId);
// //     if (!order) {
// //       return res.status(404).json({ success: false, message: "Order not found" });
// //     }

// //     if (status === "success") {
// //       order.paymentStatus = "Paid";
// //       order.orderStatus = "Processing";
// //       order.shiprocketPaymentId = shiprocketPaymentId || null;
// //       order.shiprocketOrderId = shiprocketOrderId || null;

// //       for (const item of order.items) {
// //         if (item.variantId) {
// //           await Product.updateOne(
// //             { _id: item.productId, "variants._id": item.variantId },
// //             { $inc: { "variants.$.stock": -item.quantity } }
// //           );
// //         } else {
// //           await Product.findByIdAndUpdate(item.productId, {
// //             $inc: { stock: -item.quantity },
// //           });
// //         }
// //       }

// //       await Cart.findOneAndDelete({ guestId: order.guestId });

// //       // ✅ Push to Shiprocket
// //       await pushOrderToShiprocket(order);

// //       try {
// //         const customerEmail = order.shippingAddress?.email;
// //         if (customerEmail) {
// //           const html = getCustomerOrderEmail(order, order._id);
// //           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
// //         }
// //       } catch (emailErr) {
// //         console.error("Email error:", emailErr.message);
// //       }
// //     } else {
// //       order.paymentStatus = "Failed";
// //       order.orderStatus = "Cancelled";
// //     }

// //     await order.save();
// //     res.json({ success: true, order });
// //   } catch (err) {
// //     console.error("Confirm error:", err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // });

// // // ============================================
// // // GET SINGLE ORDER
// // // ============================================
// // router.get("/single/:orderId", async (req, res) => {
// //   try {
// //     const order = await Order.findById(req.params.orderId);
// //     if (!order) return res.status(404).json({ message: "Order not found" });
// //     res.json(order);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });

// // // ============================================
// // // ✅ GET ORDERS BY GUEST — FILTERED
// // // ============================================
// // router.get("/guest/:guestId", async (req, res) => {
// //   try {
// //     const filter = getVisibleOrdersFilter({ guestId: req.params.guestId });
// //     const orders = await Order.find(filter).sort({ createdAt: -1 });

// //     console.log(`📋 Guest orders for ${req.params.guestId}: ${orders.length} visible`);

// //     res.json(orders);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });

// // // ============================================
// // // ✅ GET USER ORDERS — FILTERED
// // // ============================================
// // router.get("/user/:userId", async (req, res) => {
// //   try {
// //     const filter = getVisibleOrdersFilter({ userId: req.params.userId });
// //     const orders = await Order.find(filter).sort({ createdAt: -1 });

// //     console.log(`📋 User orders for ${req.params.userId}: ${orders.length} visible`);

// //     res.json(orders);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });

// // // ============================================
// // // ADMIN: GET ORDER WITH COMMISSION
// // // ============================================
// // router.get("/admin/commission/:orderId", async (req, res) => {
// //   try {
// //     const order = await Order.findById(req.params.orderId);
// //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// //     let totalAdminCommission = 0;
// //     let totalVendorCommission = 0;
// //     const vendorBreakdown = {};

// //     for (const item of order.items) {
// //       if (item.vendorId) {
// //         const vendorIdStr = item.vendorId.toString();
// //         const vendor = await Vendor.findById(item.vendorId).populate("planId");

// //         let commissionPercentage = 8;
// //         if (vendor && vendor.planId) {
// //           commissionPercentage = vendor.planId.commissionPercentage || 8;
// //         }

// //         const itemTotal = item.price * item.quantity;
// //         const vendorCommission = (itemTotal * commissionPercentage) / 100;
// //         const adminCommission = itemTotal - vendorCommission;

// //         totalVendorCommission += vendorCommission;
// //         totalAdminCommission += adminCommission;

// //         if (!vendorBreakdown[vendorIdStr]) {
// //           vendorBreakdown[vendorIdStr] = {
// //             company: item.company || "Unknown",
// //             vendorId: item.vendorId,
// //             vendorName: vendor?.name || "Unknown",
// //             vendorEmail: vendor?.email || "N/A",
// //             commissionPercentage: commissionPercentage,
// //             items: [],
// //             totalItemValue: 0,
// //             totalVendorCommission: 0,
// //             totalAdminCommission: 0,
// //           };
// //         }

// //         vendorBreakdown[vendorIdStr].items.push({
// //           name: item.name,
// //           price: item.price,
// //           quantity: item.quantity,
// //           total: itemTotal,
// //           vendorCommission: vendorCommission,
// //           adminCommission: adminCommission,
// //           selectedColor: item.selectedColor || "",
// //           selectedSize: item.selectedSize || "",
// //           variantImage: item.variantImage || "",
// //           customFieldLabel: item.customFieldLabel || null,
// //           customFieldValue: item.customFieldValue || null,
// //         });

// //         vendorBreakdown[vendorIdStr].totalItemValue += itemTotal;
// //         vendorBreakdown[vendorIdStr].totalVendorCommission += vendorCommission;
// //         vendorBreakdown[vendorIdStr].totalAdminCommission += adminCommission;
// //       }
// //     }

// //     res.json({
// //       success: true,
// //       orderId: order._id,
// //       orderStatus: order.orderStatus,
// //       paymentStatus: order.paymentStatus,
// //       subtotal: order.subtotal || order.totalPrice,
// //       totalPrice: order.totalPrice,
// //       coupon: order.coupon || null,
// //       createdAt: order.createdAt,
// //       shippingAddress: order.shippingAddress,
// //       paymentMethod: order.paymentMethod,
// //       shipments: order.shipments || [],
// //       shiprocketSyncStatus: order.shiprocketSyncStatus,
// //       shiprocketError: order.shiprocketError || null,
// //       commissionSummary: {
// //         totalAdminCommission,
// //         totalVendorCommission,
// //         platformCommissionRate:
// //           order.totalPrice > 0
// //             ? ((totalAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// //             : "0%",
// //         vendorCommissionRate:
// //           order.totalPrice > 0
// //             ? ((totalVendorCommission / order.totalPrice) * 100).toFixed(2) + "%"
// //             : "0%",
// //       },
// //       vendorBreakdown: Object.values(vendorBreakdown),
// //     });
// //   } catch (err) {
// //     console.error("Commission view error:", err);
// //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // });

// // // ============================================
// // // ADMIN: GET ALL ORDERS WITH COMMISSIONS
// // // ============================================
// // router.get("/admin/commissions", async (req, res) => {
// //   try {
// //     const { startDate, endDate, vendorId, status } = req.query;
// //     let filter = {};
// //     if (startDate && endDate) {
// //       filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
// //     }
// //     if (status) filter.orderStatus = status;

// //     const orders = await Order.find(filter).sort({ createdAt: -1 });
// //     const orderSummaries = [];
// //     let totalAdminCommission = 0;
// //     let totalVendorCommission = 0;
// //     let totalRevenue = 0;

// //     for (const order of orders) {
// //       let orderAdminCommission = 0;
// //       let orderVendorCommission = 0;
// //       const vendorSet = new Set();

// //       for (const item of order.items) {
// //         if (item.vendorId) {
// //           vendorSet.add(item.vendorId.toString());
// //           const vendor = await Vendor.findById(item.vendorId).populate("planId");
// //           let commissionPercentage = 8;
// //           if (vendor && vendor.planId) {
// //             commissionPercentage = vendor.planId.commissionPercentage || 8;
// //           }
// //           const itemTotal = item.price * item.quantity;
// //           const vendorCommission = (itemTotal * commissionPercentage) / 100;
// //           const adminCommission = itemTotal - vendorCommission;
// //           orderVendorCommission += vendorCommission;
// //           orderAdminCommission += adminCommission;
// //         }
// //       }

// //       totalAdminCommission += orderAdminCommission;
// //       totalVendorCommission += orderVendorCommission;
// //       totalRevenue += order.totalPrice || 0;

// //       orderSummaries.push({
// //         _id: order._id,
// //         subtotal: order.subtotal || order.totalPrice,
// //         totalPrice: order.totalPrice,
// //         coupon: order.coupon || null,
// //         orderStatus: order.orderStatus,
// //         paymentStatus: order.paymentStatus,
// //         createdAt: order.createdAt,
// //         vendorCount: vendorSet.size,
// //         shipmentCount: order.shipments?.length || 0,
// //         shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// //         adminCommission: orderAdminCommission,
// //         vendorCommission: orderVendorCommission,
// //         platformCommissionRate:
// //           order.totalPrice > 0
// //             ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// //             : "0%",
// //       });
// //     }

// //     let filteredSummaries = orderSummaries;
// //     if (vendorId) {
// //       const filteredOrders = await Order.find({ ...filter, "items.vendorId": vendorId }).sort({ createdAt: -1 });
// //       const filteredResults = [];
// //       let filteredAdminCommission = 0;
// //       let filteredVendorCommission = 0;
// //       let filteredRevenue = 0;

// //       for (const order of filteredOrders) {
// //         let orderAdminCommission = 0;
// //         let orderVendorCommission = 0;
// //         const vendorSet = new Set();

// //         for (const item of order.items) {
// //           if (item.vendorId && item.vendorId.toString() === vendorId) {
// //             vendorSet.add(item.vendorId.toString());
// //             const vendor = await Vendor.findById(item.vendorId).populate("planId");
// //             let commissionPercentage = 8;
// //             if (vendor && vendor.planId) {
// //               commissionPercentage = vendor.planId.commissionPercentage || 8;
// //             }
// //             const itemTotal = item.price * item.quantity;
// //             const vendorCommission = (itemTotal * commissionPercentage) / 100;
// //             const adminCommission = itemTotal - vendorCommission;
// //             orderVendorCommission += vendorCommission;
// //             orderAdminCommission += adminCommission;
// //           }
// //         }

// //         filteredAdminCommission += orderAdminCommission;
// //         filteredVendorCommission += orderVendorCommission;
// //         filteredRevenue += order.totalPrice || 0;

// //         filteredResults.push({
// //           _id: order._id,
// //           subtotal: order.subtotal || order.totalPrice,
// //           totalPrice: order.totalPrice,
// //           coupon: order.coupon || null,
// //           orderStatus: order.orderStatus,
// //           paymentStatus: order.paymentStatus,
// //           createdAt: order.createdAt,
// //           vendorCount: vendorSet.size,
// //           shipmentCount: order.shipments?.length || 0,
// //           shiprocketSyncStatus: order.shiprocketSyncStatus || "pending",
// //           adminCommission: orderAdminCommission,
// //           vendorCommission: orderVendorCommission,
// //           platformCommissionRate:
// //             order.totalPrice > 0
// //               ? ((orderAdminCommission / order.totalPrice) * 100).toFixed(2) + "%"
// //               : "0%",
// //         });
// //       }

// //       filteredSummaries = filteredResults;
// //       totalAdminCommission = filteredAdminCommission;
// //       totalVendorCommission = filteredVendorCommission;
// //       totalRevenue = filteredRevenue;
// //     }

// //     res.json({
// //       success: true,
// //       summary: {
// //         totalOrders: filteredSummaries.length,
// //         totalRevenue,
// //         totalAdminCommission,
// //         totalVendorCommission,
// //         platformCommissionRate:
// //           totalRevenue > 0
// //             ? ((totalAdminCommission / totalRevenue) * 100).toFixed(2) + "%"
// //             : "0%",
// //       },
// //       orders: filteredSummaries,
// //     });
// //   } catch (err) {
// //     console.error("Admin commissions fetch error:", err);
// //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // });

// // // ============================================
// // // ADMIN: UPDATE ORDER STATUS
// // // ============================================
// // router.put("/admin/status/:orderId", async (req, res) => {
// //   try {
// //     const { status } = req.body;
// //     const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// //     if (!validStatuses.includes(status)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Invalid status. Allowed: Pending, Processing, Shipped, Delivered, Cancelled",
// //       });
// //     }

// //     const order = await Order.findByIdAndUpdate(
// //       req.params.orderId,
// //       { orderStatus: status },
// //       { new: true }
// //     );

// //     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

// //     res.json({
// //       success: true,
// //       message: "Order status updated successfully",
// //       order: {
// //         _id: order._id,
// //         orderStatus: order.orderStatus,
// //         updatedAt: order.updatedAt,
// //         shipments: order.shipments || [],
// //         shiprocketSyncStatus: order.shiprocketSyncStatus,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Order status update error:", err);
// //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // });

// // // ============================================
// // // SEND ORDER CONFIRMATION EMAIL (Manual)
// // // ============================================
// // router.post("/send-confirmation", async (req, res) => {
// //   try {
// //     const {
// //       to, subject, orderId, customerName, items, subtotal,
// //       couponDiscount, shippingCost, total, paymentMethod, orderDate,
// //     } = req.body;

// //     if (!to) return res.status(400).json({ success: false, message: "Recipient email is required" });

// //     const html = `
// //       <!DOCTYPE html>
// //       <html><head><meta charset="UTF-8"><style>
// //         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; }
// //         .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; }
// //         .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
// //         .header h1 { color: #fff; margin: 0; }
// //         .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
// //         .items-table th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
// //         .items-table td { padding: 10px; border-bottom: 1px solid #dee2e6; }
// //         .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; }
// //       </style></head>
// //       <body><div class="container">
// //         <div class="header"><h1>🎉 Order Confirmed!</h1><p>Thank you, ${customerName || "Customer"}!</p></div>
// //         <div style="padding: 20px;">
// //           <p><strong>📋 Order #:</strong> ${orderId}</p>
// //           <p><strong>📅 Date:</strong> ${orderDate || new Date().toLocaleString()}</p>
// //           <p><strong>💳 Payment:</strong> ${paymentMethod || "COD"}</p>
// //           <h3>🛍️ Order Items</h3>
// //           <table class="items-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
// //           <tbody>${(items || []).map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${(item.price || 0).toFixed(2)}</td><td>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join("")}</tbody></table>
// //           <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
// //             <div><span>Subtotal</span><span style="float:right;">₹${(subtotal || 0).toFixed(2)}</span></div>
// //             ${couponDiscount > 0 ? `<div style="color:#28a745;"><span>Discount</span><span style="float:right;">-₹${(couponDiscount || 0).toFixed(2)}</span></div>` : ""}
// //             <div><span>Shipping</span><span style="float:right;">${shippingCost === 0 ? "FREE" : `₹${(shippingCost || 0).toFixed(2)}`}</span></div>
// //             <div style="font-size:20px; font-weight:bold; border-top:2px solid #28a745; margin-top:10px; padding-top:10px;"><span>Total</span><span style="float:right; color:#28a745;">₹${(total || 0).toFixed(2)}</span></div>
// //           </div>
// //           <div class="footer"><p>Thank you for shopping with us! 🛍️</p></div>
// //         </div>
// //       </div></body></html>`;

// //     const result = await sendEmail(to, subject || `Order Confirmation - #${orderId}`, html);
// //     if (result.success) {
// //       res.json({ success: true, message: "Email sent successfully" });
// //     } else {
// //       res.status(500).json({ success: false, message: "Failed to send email", error: result.error });
// //     }
// //   } catch (err) {
// //     console.error("Send confirmation error:", err);
// //     res.status(500).json({ success: false, message: "Server error", error: err.message });
// //   }
// // });

// // module.exports = router;

// // Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT + AUTO SHIPROCKET PUSH + AUTO AWB + PENDING_PAYMENT
// const express = require("express");
// const router = express.Router();
// const crypto = require("crypto");
// const Order = require("../Models/Order");
// const Cart = require("../Models/Cart");
// const Vendor = require("../Models/Vendor");
// const SellerDocument = require("../Models/SellerDocument");
// const Product = require("../Models/Product");
// const Coupon = require("../Models/Coupon");
// const axios = require("axios");

// // ✅ Direct require to avoid destructuring issues
// const emailConfig = require("../Comfig/emailConfig");
// const sendEmail = emailConfig.sendEmail;
// const getCustomerOrderEmail = emailConfig.getCustomerOrderEmail;
// const getAdminOrderEmail = emailConfig.getAdminOrderEmail;
// const getVendorOrderEmail = emailConfig.getVendorOrderEmail;
// const emailMode = emailConfig.emailMode;

// const shiprocketService = require("../utils/shiprocketService");

// const VENDOR_API_URL =
//   process.env.VENDOR_API_URL ||
//   "https://api.brandelvendor.starlighttechlabsindia.com/api";

// // ============================================
// // HELPER: Order visibility filter
// // ✅ COD orders always visible
// // ✅ Paid orders visible
// // ✅ PENDING_PAYMENT orders HIDDEN (newly added)
// // ✅ Pending placeholder Fastrr orders HIDDEN
// // ✅ Cancelled orders HIDDEN
// // ============================================
// const getVisibleOrdersFilter = (extraFilter = {}) => {
//   return {
//     ...extraFilter,
//     // ❌ Cancelled AND PENDING_PAYMENT orders hide
//     orderStatus: { $nin: ["Cancelled", "PENDING_PAYMENT"] },
//     // ❌ Placeholder emails/phones hide + only show COD/Paid
//     $and: [
//       {
//         $or: [
//           { "shippingAddress.email": { $ne: "pending@fastrr-checkout.com" } },
//           { "shippingAddress.email": { $exists: false } },
//         ],
//       },
//       {
//         $or: [
//           {
//             paymentMethod: {
//               $in: [
//                 "COD",
//                 "cod",
//                 "Cod",
//                 "Cash on Delivery",
//                 "cash on delivery",
//                 "cash_on_delivery",
//               ],
//             },
//           },
//           { paymentStatus: "Paid" },
//         ],
//       },
//     ],
//   };
// };

// // ============================================
// // HELPER: Detect placeholder addresses
// // ============================================
// const isPlaceholderAddress = (addr) => {
//   if (!addr) return true;
//   const a = String(addr.address || "").toLowerCase();
//   const e = String(addr.email || "").toLowerCase();
//   const p = String(addr.phone || "");
//   return (
//     !a ||
//     a.includes("pending") ||
//     a.includes("will be provided") ||
//     a.includes("will be captured") ||
//     e === "pending@fastrr-checkout.com" ||
//     e === "guest@native91.com" ||
//     p === "0000000000" ||
//     p === "9999999999"
//   );
// };

// // ============================================
// // PAYU HELPER FUNCTIONS
// // ============================================
// const generatePayUHash = (data) => {
//   const { key, txnid, amount, productinfo, firstname, email, salt } = data;
//   const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
//   return crypto.createHash("sha512").update(hashString).digest("hex");
// };

// const verifyPayUHash = (data) => {
//   const { key, salt, status, txnid, amount, productinfo, firstname, email, hash, additionalCharges } = data;

//   let hashString;
//   if (additionalCharges) {
//     hashString = `${additionalCharges}|${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
//   } else {
//     hashString = `${salt}|${status}||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
//   }

//   const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");
//   return calculatedHash === hash;
// };

// // ============================================
// // HELPER: Get complete vendor data
// // ============================================
// async function getCompleteVendorData(vendorId) {
//   try {
//     const vendor = await Vendor.findById(vendorId);
//     if (!vendor) return null;

//     const sellerDoc = await SellerDocument.findOne({ vendorId: vendorId });

//     return {
//       _id: vendor._id,
//       name: vendor.name || vendor.company,
//       company: vendor.company || "N/A",
//       email: vendor.email,
//       phone: vendor.phone || sellerDoc?.contact?.phone || "9876543210",
//       address: sellerDoc?.contact?.address || "Default Address",
//       city: sellerDoc?.contact?.city || "Mumbai",
//       state: sellerDoc?.contact?.state || "Maharashtra",
//       pincode: sellerDoc?.contact?.pincode || "400001",
//       country: sellerDoc?.contact?.country || "India",
//     };
//   } catch (error) {
//     console.error("Error fetching vendor data:", error.message);
//     return null;
//   }
// }

// // ============================================
// // HELPER: Normalize string
// // ============================================
// const normalizeString = (s) =>
//   (s || "").toString().trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");

// // ============================================
// // HELPER: Push order to Shiprocket Logistics (with AWB)
// // ============================================
// async function pushOrderToShiprocket(order) {
//   try {
//     if (process.env.SHIPROCKET_ENABLED !== "true") {
//       console.log("ℹ️ Shiprocket disabled — skipping push");
//       order.shiprocketSyncStatus = "disabled";
//       await order.save();
//       return;
//     }

//     console.log(`🚀 Pushing order ${order._id} to Shiprocket Logistics...`);

//     // Group items by vendor
//     const vendorItemsMap = {};
//     for (const item of order.items) {
//       const vid = item.vendorId?.toString();
//       if (!vid) continue;
//       if (!vendorItemsMap[vid]) vendorItemsMap[vid] = [];
//       vendorItemsMap[vid].push(item);
//     }

//     const vendorIds = Object.keys(vendorItemsMap);

//     if (vendorIds.length === 0) {
//       console.warn("⚠️ No vendor IDs found — skipping Shiprocket push");
//       order.shiprocketSyncStatus = "skipped";
//       order.shiprocketError = "No vendor IDs found in items";
//       await order.save();
//       return;
//     }

//     const shipmentResults = [];

//     for (const vendorId of vendorIds) {
//       try {
//         const vendorData = await getCompleteVendorData(vendorId);
//         if (!vendorData) {
//           shipmentResults.push({ vendorId, success: false, error: "Vendor not found" });
//           continue;
//         }

//         const vendorItems = vendorItemsMap[vendorId];

//         const result = await shiprocketService.createVendorShipment(
//           order,
//           vendorData,
//           vendorItems,
//           order.shippingAddress
//         );

//         shipmentResults.push(result);

//         if (result.success) {
//           console.log(`✅ Shipment created for ${vendorData.company}: ${result.shipmentId}`);
//         } else {
//           console.error(`❌ Shipment failed for ${vendorData.company}: ${result.error}`);
//         }
//       } catch (vendorErr) {
//         console.error(`❌ Vendor shipment error (${vendorId}):`, vendorErr.message);
//         shipmentResults.push({ vendorId, success: false, error: vendorErr.message });
//       }
//     }

//     const successfulShipments = shipmentResults.filter((r) => r.success);

//     // ✅ Assign AWB for each shipment
//     const shipmentsWithAWB = [];
//     for (const r of successfulShipments) {
//       let awbCode = r.awbCode || "UNKNOWN";
//       let labelUrl = r.labelUrl || "";

//       if (r.shipmentId && r.shipmentId !== "UNKNOWN" && awbCode === "UNKNOWN") {
//         try {
//           console.log(`🚚 Assigning AWB for shipment: ${r.shipmentId}`);
//           const awbResult = await shiprocketService.assignAWB(r.shipmentId);

//           if (awbResult.success) {
//             awbCode = awbResult.awbCode || "UNKNOWN";
//             console.log(`✅ AWB assigned: ${awbCode}`);

//             try {
//               const labelResult = await shiprocketService.generateLabel(r.shipmentId);
//               if (labelResult.success) {
//                 labelUrl = labelResult.labelUrl || "";
//                 console.log(`✅ Label generated`);
//               }
//             } catch (labelErr) {
//               console.warn(`⚠️ Label generation failed: ${labelErr.message}`);
//             }
//           } else {
//             console.warn(`⚠️ AWB assignment failed: ${awbResult.error}`);
//           }
//         } catch (awbErr) {
//           console.error(`❌ AWB assign error: ${awbErr.message}`);
//         }
//       }

//       shipmentsWithAWB.push({
//         vendorId: r.vendorId,
//         company: r.company,
//         shipmentId: r.shipmentId,
//         orderId: r.orderId,
//         awbCode: awbCode,
//         labelUrl: labelUrl,
//         status: "created",
//         createdAt: new Date(),
//       });
//     }

//     order.shipments = shipmentsWithAWB;

//     if (successfulShipments.length === shipmentResults.length) {
//       order.shiprocketSyncStatus = "synced";
//     } else if (successfulShipments.length > 0) {
//       order.shiprocketSyncStatus = "partial";
//     } else {
//       order.shiprocketSyncStatus = "failed";
//     }

//     await order.save();

//     console.log(`📦 Shiprocket sync: ${successfulShipments.length}/${shipmentResults.length} — status: ${order.shiprocketSyncStatus}`);
//   } catch (err) {
//     console.error("❌ Shiprocket push error:", err.message);
//     order.shiprocketSyncStatus = "failed";
//     order.shiprocketError = err.message;
//     await order.save();
//   }
// }

// // ============================================
// // FASTrr CHECKOUT — CREATE ORDER (PENDING_PAYMENT)
// // ============================================
// router.post("/shiprocket-checkout", async (req, res) => {
//   try {
//     const { guestId, shippingAddress, cartItems, couponCode, subtotal, total } = req.body;

//     if (!guestId || !cartItems || cartItems.length === 0) {
//       return res.status(400).json({ success: false, message: "Invalid cart" });
//     }

//     if (!shippingAddress || !shippingAddress.name || !shippingAddress.email) {
//       return res.status(400).json({ success: false, message: "Shipping address required" });
//     }

//     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";

//     let apiProducts = [];
//     try {
//       const apiRes = await axios.get(`${BASE_URL}/api/v2/products?page=1&limit=500`, { timeout: 10000 });
//       apiProducts = apiRes.data?.data?.products || [];
//       console.log(`📦 Fetched ${apiProducts.length} Fastrr products`);
//     } catch (apiErr) {
//       console.error("❌ Failed to fetch Fastrr catalog:", apiErr.message);
//       return res.status(500).json({
//         success: false,
//         code: "FASTRR_CATALOG_UNAVAILABLE",
//         message: "Fastrr catalog temporarily unavailable. Please use standard checkout.",
//       });
//     }

//     const itemsWithVendorInfo = [];

//     for (const item of cartItems) {
//       const product = await Product.findById(item.productId).populate({ path: "vendorId", select: "company name email _id" });

//       if (!product) {
//         return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
//       }

//       let effectiveStock = product.stock || 0;
//       let variantIdx = 0;
//       let variantDoc = null;

//       if (item.variantId && product.variants && product.variants.length > 0) {
//         variantDoc = product.variants.id(item.variantId);
//         if (!variantDoc) {
//           return res.status(400).json({ success: false, message: `Variant not found for ${product.name}` });
//         }
//         effectiveStock = variantDoc.stock || 0;
//         variantIdx = product.variants.findIndex(
//           (v) => v._id && v._id.toString() === item.variantId.toString()
//         );
//         if (variantIdx < 0) variantIdx = 0;
//       }

//       if (effectiveStock < item.quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Insufficient stock for ${product.name}. Available: ${effectiveStock}`,
//         });
//       }

//       let vendorId = null;
//       if (product.vendorId && product.vendorId._id) vendorId = product.vendorId._id;
//       else if (product.vendorId) vendorId = product.vendorId;
//       else if (product.vendor) vendorId = product.vendor;

//       const productName = (product.name || product.ProductName || "").trim();

//       let matchedApiProduct = apiProducts.find((p) => {
//         const apiTitle = (p.title || "").trim().toLowerCase();
//         return apiTitle === productName.toLowerCase();
//       });

//       if (!matchedApiProduct) {
//         const normalizedDbName = normalizeString(productName);
//         matchedApiProduct = apiProducts.find((p) => normalizeString(p.title) === normalizedDbName);
//       }

//       if (!matchedApiProduct) {
//         return res.status(400).json({
//           success: false,
//           code: "FASTRR_CATALOG_MISSING",
//           message: `"${productName}" is not yet available for Fastrr checkout. Please use standard checkout.`,
//           productName,
//           productId: item.productId,
//         });
//       }

//       let shiprocketVariantId = null;

//       if (matchedApiProduct.variants && matchedApiProduct.variants.length > 0) {
//         if (variantDoc) {
//           const variantTitle = (variantDoc.color || variantDoc.size || variantDoc.variant || "").trim().toLowerCase();
//           const matchedApiVariant = matchedApiProduct.variants.find((av) => {
//             const apiVariantTitle = (av.title || "").trim().toLowerCase();
//             return apiVariantTitle === variantTitle;
//           });

//           if (matchedApiVariant) {
//             shiprocketVariantId = matchedApiVariant.id;
//           } else {
//             shiprocketVariantId = matchedApiProduct.variants[variantIdx]?.id
//               || matchedApiProduct.variants[0]?.id
//               || null;
//           }
//         } else {
//           shiprocketVariantId = matchedApiProduct.variants[0]?.id || null;
//         }
//       }

//       if (!shiprocketVariantId) {
//         return res.status(400).json({
//           success: false,
//           code: "FASTRR_VARIANT_MISSING",
//           message: `Variant for "${productName}" is not available in Fastrr catalog. Please use standard checkout.`,
//         });
//       }

//       itemsWithVendorInfo.push({
//         productId: item.productId,
//         variantId: item.variantId || null,
//         shiprocketVariantId,
//         name: item.name || product.name,
//         price: item.price || product.price,
//         quantity: item.quantity,
//         stock: effectiveStock,
//         image: Array.isArray(item.image) ? item.image : [item.image],
//         vendorId,
//         company: product.company || product.vendorId?.company || "N/A",
//         weight: product.weight || 0.5,
//         selectedColor: item.selectedColor || "",
//         selectedSize: item.selectedSize || "",
//         variantImage: item.variantImage || "",
//         variantPrice: item.variantPrice || 0,
//         customFieldLabel: item.customFieldLabel || null,
//         customFieldValue: item.customFieldValue || null,
//         sku: item.sku || "",
//       });
//     }

//     // ============================================================
//     // ✅ ORDER CREATE WITH PENDING_PAYMENT
//     // ============================================================
//     const order = new Order({
//       guestId,
//       items: itemsWithVendorInfo,
//       shippingAddress,
//       paymentMethod: "Shiprocket",
//       paymentStatus: "Pending",
//       subtotal,
//       totalPrice: total,
//       orderStatus: "PENDING_PAYMENT",
//       coupon: couponCode
//         ? { code: couponCode, discountAmount: Number((subtotal - total).toFixed(2)) }
//         : { code: null, discountAmount: 0 },
//     });

//     await order.save();

//     const accessTokenPayload = {
//       cart_data: {
//         items: itemsWithVendorInfo.map((i) => ({
//           variant_id: String(i.shiprocketVariantId),
//           quantity: Number(i.quantity),
//         })),
//       },
//       redirect_url: `${process.env.FRONTEND_URL}/order-complete?orderId=${order._id}`,
//       timestamp: new Date().toISOString(),
//     };

//     const payloadString = JSON.stringify(accessTokenPayload);
//     const hmac = crypto
//       .createHmac("sha256", process.env.SHIPROCKET_CHECKOUT_SECRET)
//       .update(payloadString)
//       .digest("base64");

//     console.log("🔑 Fastrr Access Token Request");

//     let accessToken = null;
//     let shiprocketOrderId = null;

//     try {
//       const tokenResponse = await axios.post(
//         "https://checkout-api.shiprocket.com/api/v1/access-token/checkout",
//         payloadString,
//         {
//           headers: {
//             "X-Api-Key": process.env.SHIPROCKET_CHECKOUT_API_KEY,
//             "X-Api-HMAC-SHA256": hmac,
//             "Content-Type": "application/json",
//           },
//           timeout: 15000,
//         }
//       );

//       accessToken = tokenResponse.data?.result?.token || tokenResponse.data?.token || null;
//       shiprocketOrderId = tokenResponse.data?.result?.data?.order_id
//         || tokenResponse.data?.result?.order_id
//         || tokenResponse.data?.order_id
//         || null;

//       const fastrrCartId =
//         tokenResponse.data?.result?.data?.cart_id ||
//         tokenResponse.data?.result?.cart_id ||
//         tokenResponse.data?.cart_id ||
//         null;

//       console.log(`🔍 Extracted: orderId=${shiprocketOrderId}, cartId=${fastrrCartId}`);

//       if (shiprocketOrderId) {
//         order.shiprocketOrderId = shiprocketOrderId;
//         if (fastrrCartId) order.fastrrCartId = fastrrCartId;
//         await order.save();
//       }
//     } catch (tokenErr) {
//       console.error("❌ Fastrr Token API error:", tokenErr.response?.data || tokenErr.message);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to generate checkout token",
//         error: tokenErr.response?.data || tokenErr.message,
//       });
//     }

//     if (!accessToken) {
//       return res.status(500).json({
//         success: false,
//         message: "No access token received from Fastrr",
//       });
//     }

//     res.json({
//       success: true,
//       orderId: order._id,
//       accessToken,
//       shiprocketOrderId,
//       fastrrCartId: order.fastrrCartId,
//     });
//   } catch (err) {
//     console.error("Shiprocket checkout create error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================
// // FASTrr CHECKOUT — ORDER WEBHOOK
// // ============================================
// router.post("/shiprocket-webhook", async (req, res) => {
//   try {
//     console.log("📩 Fastrr Webhook received:", JSON.stringify(req.body, null, 2));

//     const {
//       cart_id,
//       latest_stage,
//       email,
//       phone_number,
//       total_price,
//       shipping_address,
//       paymentDetails,
//       order_id,
//       payment_method,
//       payment_type,
//       is_cod,
//     } = req.body;

//     const rawPaymentMode = String(
//       paymentDetails?.paymentMode || payment_method || payment_type || ""
//     ).toLowerCase().trim();

//     const isCOD =
//       is_cod === true ||
//       is_cod === "true" ||
//       rawPaymentMode === "cod" ||
//       rawPaymentMode === "cash on delivery" ||
//       rawPaymentMode === "cash_on_delivery";

//     const isPaid =
//       latest_stage === "ORDER_PLACED" &&
//       !isCOD &&
//       (paymentDetails?.transactionId ||
//         ["upi", "card", "netbanking", "wallet", "prepaid"].includes(rawPaymentMode));

//     const assumeCOD =
//       latest_stage === "ORDER_PLACED" && !isPaid && !rawPaymentMode;

//     console.log(`💳 Payment detection → mode: "${rawPaymentMode}", stage: "${latest_stage}", isCOD: ${isCOD}, isPaid: ${isPaid}, assumeCOD: ${assumeCOD}`);

//     // ============================================================
//     // 4-STEP ORDER MATCHING
//     // ============================================================
//     let order = null;
//     let matchSource = null;

//     if (cart_id) {
//       order = await Order.findOne({ fastrrCartId: cart_id });
//       if (order) matchSource = "fastrrCartId";
//     }

//     if (!order && order_id) {
//       order = await Order.findOne({ shiprocketOrderId: order_id });
//       if (order) matchSource = "shiprocketOrderId";
//     }

//     if (!order && (email || phone_number)) {
//       const orConditions = [];
//       if (email) orConditions.push({ "shippingAddress.email": email });
//       if (phone_number) orConditions.push({ "shippingAddress.phone": phone_number });

//       order = await Order.findOne({
//         paymentMethod: "Shiprocket",
//         orderStatus: "PENDING_PAYMENT",
//         $and: [
//           { $or: [{ fastrrCartId: null }, { fastrrCartId: { $exists: false } }] },
//           { $or: orConditions },
//         ],
//         createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
//       }).sort({ createdAt: -1 });
//       if (order) matchSource = "email/phone";
//     }

//     if (!order) {
//       order = await Order.findOne({
//         paymentMethod: "Shiprocket",
//         orderStatus: "PENDING_PAYMENT",
//         $or: [{ fastrrCartId: null }, { fastrrCartId: { $exists: false } }],
//         createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
//       }).sort({ createdAt: -1 });
//       if (order) matchSource = "recent-fallback";
//     }

//     if (!order) {
//       console.warn("⚠️ No matching order found. cart_id:", cart_id);
//       return res.json({ success: true, message: "Order not found" });
//     }

//     console.log(`✅ Order matched via ${matchSource}: ${order._id}`);

//     if (cart_id && !order.fastrrCartId) {
//       order.fastrrCartId = cart_id;
//     }

//     if (order.orderStatus === "Cancelled") {
//       await order.save();
//       return res.json({ success: true, message: "Order cancelled" });
//     }

//     const buildAddressFromFastrr = (addr, fallbackEmail, fallbackPhone) => {
//       if (!addr) return null;
//       const fullName = `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || addr.name || "Customer";
//       return {
//         name: fullName,
//         email: fallbackEmail && fallbackEmail !== "pending@fastrr-checkout.com"
//           ? fallbackEmail
//           : (order.shippingAddress?.email && order.shippingAddress.email !== "pending@fastrr-checkout.com"
//             ? order.shippingAddress.email
//             : fallbackEmail || "customer@native91.com"),
//         phone: addr.phone || fallbackPhone || order.shippingAddress?.phone || "",
//         address: [addr.address1, addr.address2].filter(Boolean).join(", ") || "Address not provided",
//         city: addr.city || "",
//         state: addr.state || "",
//         pincode: addr.zip || addr.pincode || "",
//         country: addr.country || "India",
//       };
//     };

//     const realShippingAddress = buildAddressFromFastrr(shipping_address, email, phone_number);

//     // ============================================================
//     // CASE 1: ORDER PLACED
//     // ============================================================
//     if (latest_stage === "ORDER_PLACED") {
//       console.log(`🟢 ORDER_PLACED detected`);

//       if (isCOD || assumeCOD) {
//         order.paymentMethod = "COD";
//         order.paymentStatus = "Pending";
//         console.log(`✅ Set as COD`);
//       } else if (isPaid) {
//         order.paymentMethod = rawPaymentMode
//           ? rawPaymentMode.charAt(0).toUpperCase() + rawPaymentMode.slice(1)
//           : "Prepaid";
//         order.paymentStatus = "Paid";
//         if (paymentDetails?.transactionId) {
//           order.shiprocketPaymentId = String(paymentDetails.transactionId);
//         }
//         console.log(`✅ Set as Paid (${order.paymentMethod})`);
//       } else {
//         order.paymentMethod = "COD";
//         order.paymentStatus = "Pending";
//         console.log(`⚠️ Defaulting to COD`);
//       }

//       order.orderStatus = "Processing";
//       order.totalPrice = total_price || order.totalPrice;

//       if (realShippingAddress) {
//         order.shippingAddress = realShippingAddress;
//         console.log(`✅ Real address updated`);
//       }

//       order.statusUpdatedAt = new Date();
//       order.statusHistory = order.statusHistory || [];
//       order.statusHistory.push({
//         status: "Processing",
//         updatedAt: new Date(),
//         updatedBy: null,
//         note: isCOD || assumeCOD
//           ? "COD order confirmed via Fastrr webhook"
//           : `Paid via ${order.paymentMethod} (Fastrr webhook)`,
//       });

//       await order.save();

//       for (const item of order.items) {
//         if (item.variantId) {
//           await Product.updateOne(
//             { _id: item.productId, "variants._id": item.variantId },
//             { $inc: { "variants.$.stock": -item.quantity } }
//           );
//         } else {
//           await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
//         }
//       }

//       await Cart.findOneAndDelete({ guestId: order.guestId });

//       // ✅ PUSH TO SHIPROCKET
//       await pushOrderToShiprocket(order);

//       try {
//         const customerEmail = order.shippingAddress?.email;
//         if (customerEmail && typeof getCustomerOrderEmail === "function") {
//           const html = getCustomerOrderEmail(order, order._id);
//           await sendEmail(customerEmail, `Order Confirmed! - Order #${order._id}`, html);
//         }
//       } catch (emailErr) {
//         console.error("Customer email error:", emailErr.message);
//       }

//       try {
//         const adminEmail = process.env.ADMIN_EMAIL || "orders@native91.com";
//         if (adminEmail && typeof getAdminOrderEmail === "function") {
//           const adminHtml = getAdminOrderEmail(order, order._id);
//           await sendEmail(adminEmail, `New Order - #${order._id}`, adminHtml);
//         }
//       } catch (emailErr) {
//         console.error("Admin email error:", emailErr.message);
//       }

//       return res.json({
//         success: true,
//         orderId: order._id,
//         type: "ORDER_PLACED",
//         shiprocketSyncStatus: order.shiprocketSyncStatus,
//       });
//     }

//     // ============================================================
//     // CASE 2: PAYMENT_INITIATED
//     // ============================================================
//     if (latest_stage === "PAYMENT_INITIATED") {
//       console.log(`🟡 PAYMENT_INITIATED — saving address`);

//       if (realShippingAddress) {
//         order.shippingAddress = realShippingAddress;
//       }

//       if (cart_id) order.fastrrCartId = cart_id;
//       await order.save();

//       return res.json({ success: true, orderId: order._id, type: "PAYMENT_INITIATED" });
//     }

//     // ============================================================
//     // CASE 3: INIT
//     // ============================================================
//     if (latest_stage === "INIT") {
//       console.log(`🔵 INIT — saving fastrrCartId`);

//       if (cart_id) order.fastrrCartId = cart_id;
//       await order.save();

//       return res.json({ success: true, orderId: order._id, type: "INIT" });
//     }

//     // ============================================================
//     // CASE 4: CANCELLED / FAILED
//     // ============================================================
//     if (latest_stage === "CANCELLED" || latest_stage === "FAILED") {
//       console.log(`🔴 ${latest_stage} — cancelling order`);

//       order.paymentStatus = "Failed";
//       order.orderStatus = "Cancelled";
//       order.statusUpdatedAt = new Date();
//       order.statusHistory = order.statusHistory || [];
//       order.statusHistory.push({
//         status: "Cancelled",
//         updatedAt: new Date(),
//         updatedBy: null,
//         note: `Auto-cancelled via Fastrr webhook (${latest_stage})`,
//       });

//       await order.save();
//       return res.json({ success: true, orderId: order._id, type: latest_stage });
//     }

//     res.json({ success: true, orderId: order._id, type: "UNKNOWN" });
//   } catch (err) {
//     console.error("Fastrr webhook error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================
// // 🆕 SHIPROCKET LOGISTICS WEBHOOK
// // ============================================
// router.post("/shiprocket-logistics-webhook", async (req, res) => {
//   try {
//     console.log("📩 Shiprocket Logistics Webhook received:");
//     console.log(JSON.stringify(req.body, null, 2));

//     const incomingToken = req.headers["x-api-key"];
//     const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN || "starlight-secret-2026";

//     if (incomingToken && incomingToken !== expectedToken) {
//       console.warn(`⚠️ Invalid webhook token`);
//       return res.status(401).json({ success: false, message: "Invalid token" });
//     }

//     const {
//       awb,
//       current_status,
//       shipment_id,
//       order_id,
//       channel_order_id,
//       courier_name,
//       scans,
//     } = req.body;

//     console.log(`📦 Webhook → AWB: ${awb}, Status: ${current_status}, Shipment: ${shipment_id}`);

//     let order = null;

//     if (awb) {
//       order = await Order.findOne({ "shipments.awbCode": awb });
//     }

//     if (!order && shipment_id) {
//       order = await Order.findOne({ "shipments.shipmentId": String(shipment_id) });
//     }

//     if (!order && channel_order_id) {
//       const nativeOrderId = String(channel_order_id).split("-")[0];
//       if (nativeOrderId) {
//         order = await Order.findById(nativeOrderId).catch(() => null);
//       }
//     }

//     if (!order) {
//       console.warn(`⚠️ No order found for webhook`);
//       return res.json({ success: true, message: "Order not found but webhook received" });
//     }

//     console.log(`✅ Order matched: ${order._id}`);

//     const statusMap = {
//       "PICKED UP": "pickup_scheduled",
//       "IN TRANSIT": "in_transit",
//       "OUT FOR DELIVERY": "in_transit",
//       "DELIVERED": "delivered",
//       "RTO": "cancelled",
//       "CANCELLED": "cancelled",
//       "UNDELIVERED": "cancelled",
//     };

//     const mappedStatus = statusMap[String(current_status || "").toUpperCase()] || "created";

//     order.shipments = (order.shipments || []).map((s) => {
//       const shipmentObj = s.toObject ? s.toObject() : s;
//       if (shipmentObj.awbCode === awb || shipmentObj.shipmentId === String(shipment_id)) {
//         return {
//           ...shipmentObj,
//           status: mappedStatus,
//           trackingUrl: awb ? `https://www.shiprocket.in/tracking?awb=${awb}` : shipmentObj.trackingUrl,
//         };
//       }
//       return shipmentObj;
//     });

//     if (mappedStatus === "delivered") {
//       order.orderStatus = "Delivered";
//     } else if (mappedStatus === "in_transit") {
//       order.orderStatus = "Shipped";
//     } else if (mappedStatus === "cancelled") {
//       order.orderStatus = "Cancelled";
//     }

//     order.statusUpdatedAt = new Date();
//     order.statusHistory = order.statusHistory || [];
//     order.statusHistory.push({
//       status: order.orderStatus,
//       updatedAt: new Date(),
//       updatedBy: null,
//       note: `Shiprocket Logistics: ${current_status} (AWB: ${awb || "N/A"})`,
//     });

//     await order.save();

//     console.log(`✅ Order ${order._id} updated → ${order.orderStatus} (${mappedStatus})`);

//     res.json({ success: true, orderId: order._id });
//   } catch (err) {
//     console.error("❌ Shiprocket Logistics webhook error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================
// // FASTrr CHECKOUT — CONFIRM (from frontend)
// // ============================================
// router.post("/shiprocket-confirm", async (req, res) => {
//   try {
//     const { orderId, shiprocketPaymentId, shiprocketOrderId, status } = req.body;

//     if (!orderId) {
//       return res.status(400).json({ success: false, message: "orderId required" });
//     }

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (status === "success") {
//       order.paymentStatus = "Paid";
//       order.orderStatus = "Processing";
//       order.shiprocketPaymentId = shiprocketPaymentId || null;
//       order.shiprocketOrderId = shiprocketOrderId || null;

//       for (const item of order.items) {
//         if (item.variantId) {
//           await Product.updateOne(
//             { _id: item.productId, "variants._id": item.variantId },
//             { $inc: { "variants.$.stock": -item.quantity } }
//           );
//         } else {
//           await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
//         }
//       }

//       await Cart.findOneAndDelete({ guestId: order.guestId });
//       await pushOrderToShiprocket(order);
//     } else {
//       order.paymentStatus = "Failed";
//       order.orderStatus = "Cancelled";
//     }

//     await order.save();
//     res.json({ success: true, order });
//   } catch (err) {
//     console.error("Confirm error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ============================================
// // GET ORDERS BY GUEST — FILTERED
// // ============================================
// router.get("/guest/:guestId", async (req, res) => {
//   try {
//     const filter = getVisibleOrdersFilter({ guestId: req.params.guestId });
//     const orders = await Order.find(filter).sort({ createdAt: -1 });

//     console.log(`📋 Guest orders: ${orders.length} visible`);
//     res.json(orders);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ============================================
// // GET USER ORDERS — FILTERED
// // ============================================
// router.get("/user/:userId", async (req, res) => {
//   try {
//     const filter = getVisibleOrdersFilter({ userId: req.params.userId });
//     const orders = await Order.find(filter).sort({ createdAt: -1 });

//     console.log(`📋 User orders: ${orders.length} visible`);
//     res.json(orders);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ============================================
// // GET SINGLE ORDER
// // ============================================
// router.get("/single/:orderId", async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ============================================
// // CHECK FASTRR COMPATIBILITY
// // ============================================
// router.post("/check-fastrr-compatibility", async (req, res) => {
//   try {
//     const { cartItems } = req.body;

//     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
//       return res.status(400).json({ compatible: false, reason: "Cart is empty" });
//     }

//     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
//     let apiProducts = [];

//     try {
//       const apiRes = await axios.get(`${BASE_URL}/api/v2/products?page=1&limit=500`, { timeout: 10000 });
//       apiProducts = apiRes.data?.data?.products || [];
//     } catch (apiErr) {
//       return res.status(500).json({ compatible: false, reason: "Fastrr catalog unavailable" });
//     }

//     for (const item of cartItems) {
//       let productName = (item.name || "").trim();

//       if (item.productId) {
//         try {
//           const product = await Product.findById(item.productId);
//           if (product) productName = (product.name || product.ProductName || productName).trim();
//         } catch (dbErr) {}
//       }

//       if (!productName) return res.json({ compatible: false, reason: "Product name missing" });

//       const lowerName = productName.toLowerCase();
//       const normalizedName = normalizeString(productName);

//       let matched = apiProducts.find((p) => (p.title || "").trim().toLowerCase() === lowerName);
//       if (!matched) matched = apiProducts.find((p) => normalizeString(p.title) === normalizedName);

//       if (!matched) {
//         return res.json({
//           compatible: false,
//           reason: `"${productName}" is not yet available for Fastrr checkout.`,
//           productName,
//         });
//       }
//     }

//     return res.json({ compatible: true });
//   } catch (error) {
//     return res.status(500).json({ compatible: false, reason: "Check failed", error: error.message });
//   }
// });

// // ============================================
// // FASTrr STATUS CHECK
// // ============================================
// router.get("/fastrr-status/:productId", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.productId);
//     if (!product) return res.json({ synced: false, reason: "product_not_found" });

//     const BASE_URL = process.env.BACKEND_URL || "https://api.native91.com";
//     const apiRes = await axios.get(`${BASE_URL}/api/v2/products?limit=500`, { timeout: 10000 });
//     const apiProducts = apiRes.data?.data?.products || [];

//     const productName = (product.name || "").trim();
//     const normalizedDbName = normalizeString(productName);

//     const matched = apiProducts.find((p) => normalizeString(p.title) === normalizedDbName);

//     res.json({ synced: !!matched, productName, matchedTitle: matched?.title || null });
//   } catch (err) {
//     console.error("Fastrr status check error:", err.message);
//     res.json({ synced: false, reason: "api_error", error: err.message });
//   }
// });

// // ============================================
// // STANDARD PLACE ORDER (COD/PayU)
// // ============================================
// router.post("/place", async (req, res) => {
//   const { guestId, shippingAddress, paymentMethod, couponCode } = req.body;

//   if (!guestId || !shippingAddress) {
//     return res.status(400).json({ success: false, message: "Incomplete data" });
//   }

//   try {
//     const cart = await Cart.findOne({ guestId });
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ success: false, message: "Cart is empty" });
//     }

//     const itemsWithVendorInfo = await Promise.all(
//       cart.items.map(async (item) => {
//         const product = await Product.findById(item.productId).populate({
//           path: "vendorId",
//           select: "company name email _id",
//         });

//         let company = null;
//         let vendorId = null;

//         if (product?.vendorId) {
//           vendorId = product.vendorId._id || product.vendorId;
//         }
//         if (!vendorId && product?.vendor) vendorId = product.vendor;
//         if (!vendorId && item.company) {
//           const v = await Vendor.findOne({ company: { $regex: new RegExp(`^${item.company}$`, "i") } });
//           if (v) vendorId = v._id;
//         }

//         if (product && product.company) company = product.company;
//         else if (product && product.vendorId && product.vendorId.company) company = product.vendorId.company;
//         else if (product && product.vendor) {
//           const vd = await Vendor.findById(product.vendor);
//           if (vd && vd.company) company = vd.company;
//         }
//         if (!company && vendorId) {
//           const v = await Vendor.findById(vendorId);
//           if (v && v.company) company = v.company;
//         }
//         if (!company && item.company) company = item.company;

//         return {
//           productId: item.productId,
//           name: item.name || product?.name || "Unknown Product",
//           price: item.price || product?.price || 0,
//           quantity: item.quantity || 1,
//           stock: product?.stock || 0,
//           image: item.variantImage || (Array.isArray(item.image) ? item.image[0] : item.image) || product?.image?.[0] || null,
//           vendorId,
//           company: company || "N/A",
//           weight: product?.weight || 0.5,
//           variantId: item.variantId || null,
//           selectedColor: item.selectedColor || "",
//           selectedSize: item.selectedSize || "",
//           variantImage: item.variantImage || "",
//           variantPrice: item.variantPrice || 0,
//           customFieldLabel: item.customFieldLabel || null,
//           customFieldValue: item.customFieldValue || null,
//         };
//       })
//     );

//     for (const item of itemsWithVendorInfo) {
//       const product = await Product.findById(item.productId);
//       if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });

//       if (item.variantId && product.variants?.length > 0) {
//         const variant = product.variants.id(item.variantId);
//         if (!variant || variant.stock < item.quantity) {
//           return res.status(400).json({ success: false, message: `Insufficient stock: ${product.name}` });
//         }
//       } else if (product.stock < item.quantity) {
//         return res.status(400).json({ success: false, message: `Insufficient stock: ${product.name}` });
//       }
//     }

//     let subtotal = cart.items.reduce((a, i) => a + i.price * i.quantity, 0);
//     let totalPrice = subtotal;
//     let couponData = { code: null, discountType: null, discountValue: 0, discountAmount: 0, couponId: null };

//     if (couponCode) {
//       try {
//         const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
//         if (coupon) {
//           const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
//           const limitReached = coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit;
//           const minNotMet = coupon.minOrderAmount && subtotal < coupon.minOrderAmount;

//           if (!isExpired && !limitReached && !minNotMet) {
//             let discount = 0;
//             if (coupon.discountType === "percentage") {
//               discount = (subtotal * coupon.discountValue) / 100;
//               if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
//             } else {
//               discount = Math.min(coupon.discountValue, subtotal);
//             }
//             totalPrice = subtotal - discount;
//             couponData = {
//               code: coupon.code,
//               discountType: coupon.discountType,
//               discountValue: coupon.discountValue,
//               discountAmount: Number(discount.toFixed(2)),
//               couponId: coupon._id,
//             };
//             coupon.usageCount = (coupon.usageCount || 0) + 1;
//             await coupon.save();
//           }
//         }
//       } catch (couponError) {}
//     }

//     const order = new Order({
//       guestId,
//       items: itemsWithVendorInfo.map((item) => ({
//         productId: item.productId,
//         name: item.name,
//         price: item.price,
//         quantity: item.quantity,
//         stockAtPurchase: item.stock,
//         image: item.image ? [item.image] : [],
//         vendorId: item.vendorId,
//         company: item.company,
//         weight: item.weight || 0.5,
//         variantId: item.variantId || null,
//         selectedColor: item.selectedColor || "",
//         selectedSize: item.selectedSize || "",
//         variantImage: item.variantImage || "",
//         variantPrice: item.variantPrice || 0,
//         customFieldLabel: item.customFieldLabel || null,
//         customFieldValue: item.customFieldValue || null,
//       })),
//       shippingAddress,
//       paymentMethod: paymentMethod || "COD",
//       paymentStatus: "Pending",
//       subtotal,
//       totalPrice,
//       coupon: couponData,
//       orderStatus: "Pending",
//     });

//     await order.save();

//     for (const item of itemsWithVendorInfo) {
//       if (item.variantId) {
//         await Product.updateOne(
//           { _id: item.productId, "variants._id": item.variantId },
//           { $inc: { "variants.$.stock": -item.quantity } }
//         );
//       } else {
//         await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
//       }
//     }

//     await Cart.findOneAndDelete({ guestId });
//     await pushOrderToShiprocket(order);

//     res.json({
//       success: true,
//       message: "Order placed successfully",
//       orderId: order._id,
//       order: { _id: order._id, subtotal: order.subtotal, totalPrice: order.totalPrice, coupon: order.coupon },
//     });
//   } catch (err) {
//     console.error("Order placement error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// });

// module.exports = router;




// Router/orderRouter.js - COMPLETE WITH FASTrr CHECKOUT + AUTO SHIPROCKET PUSH + AUTO AWB + PENDING_PAYMENT + COD CHARGES
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