// Config/emailConfig.js - FINAL WORKING VERSION
const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;
let emailMode = "none";

// ============================================================
// ADMIN EMAIL
// ============================================================
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "orders@native91.com";

// ============================================================
// HARDCODED HOSTINGER SETTINGS - COMPLETELY IGNORES .env
// ============================================================
const HOSTINGER_CONFIG = {
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "orders@native91.com",
    pass: process.env.EMAIL_PASS || "Orders@&2026",
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
};

// ============================================================
// INITIALIZE EMAIL TRANSPORTER
// ============================================================
const initEmailTransporter = async () => {
  console.log("Configuring Hostinger Webmail...");
  
  const emailPass = process.env.EMAIL_PASS || "Orders@&2026";
  
  // Update password in config
  HOSTINGER_CONFIG.auth.pass = emailPass;
  
  try {
    transporter = nodemailer.createTransport(HOSTINGER_CONFIG);
    
    // Verify connection
    await transporter.verify();
    emailMode = "smtp";
    // console.log("Hostinger SMTP configured successfully!");
    // console.log(`   Sending from: orders@native91.com`);
    // console.log(`   Host: smtp.hostinger.com:465`);
    return true;
  } catch (error) {
    console.error("SMTP configuration failed:", error.message);
    // console.log("   Please check your email password");
    // console.log("   Try logging in at: https://webmail.native91.com");
    // console.log("   Email mode set to CONSOLE (emails will be printed)");
    emailMode = "console";
    return false;
  }
};

// Initialize on startup
initEmailTransporter();

// ============================================================
// SEND EMAIL FUNCTION
// ============================================================
const sendEmail = async (to, subject, html) => {
  // Console mode
  if (emailMode === "console" || !transporter) {
    console.log("=========================================");
    console.log("EMAIL (CONSOLE MODE)");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: orders@native91.com`);
    console.log("=========================================");
    return { success: true, mode: "console" };
  }

  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  try {
    const mailOptions = {
      from: `"Native91" <orders@native91.com>`,
      to: to,
      subject: subject,
      html: html,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
    return { success: true, info, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ============================================================
// CUSTOMER ORDER EMAIL
// ============================================================
// const getCustomerOrderEmail = (order, orderId) => {
//   const itemsList = (order.items || []).map(item => `
//     <tr>
//       <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
//       <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
//       <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
//       <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
//     </tr>
//   `).join("");

//   const totalAmount = order.totalPrice || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Order Confirmation</title>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
//         .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
//         .header { background: linear-gradient(135deg, #28a745, #218838); padding: 30px 20px; text-align: center; }
//         .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
//         .header p { color: #e8f5e9; margin: 5px 0 0; }
//         .content { padding: 20px; }
//         .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
//         .order-details p { margin: 5px 0; }
//         table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//         th { background: #28a745; color: white; padding: 12px; text-align: left; }
//         td { padding: 10px; border-bottom: 1px solid #ddd; }
//         .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #28a745; }
//         .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 18px; font-weight: bold; }
//         .total-amount { color: #28a745; font-size: 24px; }
//         .shipping-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
//         .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//         .badge { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>🎉 Order Confirmed!</h1>
//           <p>Thank you for your order, ${order.shippingAddress?.name || "Customer"}!</p>
//         </div>
//         <div class="content">
//           <div class="order-details">
//             <p><strong>📋 Order #:</strong> ${orderId}</p>
//             <p><strong>📅 Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
//             <p><strong>💳 Payment:</strong> ${order.paymentMethod || "COD"}</p>
//             <p><strong>📦 Status:</strong> <span class="badge">${order.orderStatus || "Pending"}</span></p>
//           </div>

//           <h3>🛍️ Order Items</h3>
//           <table>
//             <thead>
//               <tr><th>Product</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th><th style="text-align: right;">Total</th></tr>
//             </thead>
//             <tbody>${itemsList}</tbody>
//           </table>

//           <div class="total-section">
//             <div class="total-row">
//               <span>Total</span>
//               <span class="total-amount">₹${totalAmount.toFixed(2)}</span>
//             </div>
//           </div>

//           <div class="shipping-info">
//             <h4>📦 Shipping Address</h4>
//             <p><strong>Name:</strong> ${order.shippingAddress?.name || "N/A"}</p>
//             <p><strong>Phone:</strong> ${order.shippingAddress?.phone || "N/A"}</p>
//             <p><strong>Address:</strong> ${order.shippingAddress?.address || "N/A"}</p>
//             <p><strong>City:</strong> ${order.shippingAddress?.city || "N/A"}</p>
//             <p><strong>State:</strong> ${order.shippingAddress?.state || "N/A"}</p>
//             <p><strong>Pincode:</strong> ${order.shippingAddress?.pincode || "N/A"}</p>
//           </div>
//         </div>
//         <div class="footer">
//           <p>Thank you for shopping with Native91! 🛍️</p>
//           <p style="font-size: 12px;">This is a system generated email. Please do not reply.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// ============================================================
// ADMIN ORDER EMAIL
// ============================================================
const getAdminOrderEmail = (order, orderId) => {
  const itemsList = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.company || "N/A"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const totalAmount = order.totalPrice || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - Admin</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .header p { color: #ffe0b2; margin: 5px 0 0; }
        .content { padding: 20px; }
        .alert { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f7931e; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #f7931e; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 18px; font-weight: bold; }
        .total-amount { color: #f7931e; font-size: 24px; }
        .customer-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .badge { display: inline-block; background: #ffc107; color: #333; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 New Order Received!</h1>
          <p>Order #${orderId}</p>
        </div>
        <div class="content">
          <div class="alert">
            <strong>⚠️ New order alert!</strong> A new order has been placed and requires your attention.
          </div>

          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <div><strong>📅 Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
            <div><strong>💳 Payment:</strong> ${order.paymentMethod || "COD"}</div>
            <div><strong>📦 Status:</strong> <span class="badge">${order.orderStatus || "Pending"}</span></div>
          </div>

          <h3>🛍️ Order Items</h3>
          <table>
            <thead>
              <tr><th>Product</th><th>Company</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th><th style="text-align: right;">Total</th></tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Total</span>
              <span class="total-amount">₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="customer-info">
            <h4>📦 Customer Details</h4>
            <p><strong>Name:</strong> ${order.shippingAddress?.name || "N/A"}</p>
            <p><strong>Email:</strong> ${order.shippingAddress?.email || "N/A"}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${order.shippingAddress?.address || "N/A"}</p>
            <p><strong>City:</strong> ${order.shippingAddress?.city || "N/A"}, ${order.shippingAddress?.state || "N/A"} - ${order.shippingAddress?.pincode || "N/A"}</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Native91.</p>
          <p style="font-size: 12px;">Please login to the admin panel to process this order.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================================
// VENDOR ORDER EMAIL
// ============================================================
const getVendorOrderEmail = (order, orderId, vendorItems, vendor) => {
  const itemsList = (vendorItems || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join("");

  const vendorTotal = (vendorItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - Vendor</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #2196F3, #1976D2); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .header p { color: #e3f2fd; margin: 5px 0 0; }
        .content { padding: 20px; }
        .order-info { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2196F3; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total-section { margin-top: 20px; padding-top: 15px; border-top: 2px solid #2196F3; }
        .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 18px; font-weight: bold; }
        .total-amount { color: #2196F3; font-size: 24px; }
        .customer-info { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .badge { display: inline-block; background: #2196F3; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 New Order Received!</h1>
          <p>${vendor?.shopName || vendor?.name || "Vendor"}</p>
        </div>
        <div class="content">
          <div class="order-info">
            <p><strong>📋 Order #:</strong> ${orderId}</p>
            <p><strong>📅 Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>📦 Status:</strong> <span class="badge">${order.orderStatus || "Pending"}</span></p>
          </div>

          <h3>🛍️ Your Products</h3>
          <table>
            <thead>
              <tr><th>Product</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Price</th><th style="text-align: right;">Total</th></tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Your Total</span>
              <span class="total-amount">₹${vendorTotal.toFixed(2)}</span>
            </div>
          </div>

          <div class="customer-info">
            <h4>👤 Customer Details</h4>
            <p><strong>Name:</strong> ${order.shippingAddress?.name || "N/A"}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phone || "N/A"}</p>
            <p><strong>Address:</strong> ${order.shippingAddress?.address || "N/A"}</p>
            <p><strong>City:</strong> ${order.shippingAddress?.city || "N/A"}</p>
            <p><strong>State:</strong> ${order.shippingAddress?.state || "N/A"}</p>
            <p><strong>Pincode:</strong> ${order.shippingAddress?.pincode || "N/A"}</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>📌 Action Required:</strong>
            <p style="margin: 5px 0 0;">Please prepare these items for shipping and update the order status.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from Native91.</p>
          <p style="font-size: 12px;">Please login to your vendor dashboard to manage this order.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  sendEmail,
  // getCustomerOrderEmail,
  getAdminOrderEmail,
  getVendorOrderEmail,
  emailMode,
  ADMIN_EMAIL,
};