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
const getVendorOrderEmail = (order, orderId, vendorItems, vendor, customerName = "Brandel") => {
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
    <body style="margin:0;padding:0;background:#F5F5F5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F5F5">
        <tr>
          <td align="center" style="padding:20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="border-radius:8px;">
              <!-- Header -->
              <tr>
                <td align="center" bgcolor="#0D3B2E" style="padding:25px;">
                  <div style="color:#FFFFFF;font-size:32px;font-weight:bold;font-family:Arial,sans-serif;letter-spacing:2px;">
                    NATIVE91
                  </div>
                  <div style="color:#D8E7DF;font-size:11px;font-family:Arial,sans-serif;padding-top:6px;">
                    RESERVED FOR THE REMARKABLE
                  </div>
                </td>
              </tr>

              <!-- Status -->
              <tr>
                <td align="center" style="padding:25px 20px 10px;font-family:Arial,sans-serif;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" width="120">
                        <table width="34" height="34" cellpadding="0" cellspacing="0" bgcolor="#E8F1EC" style="border-radius:17px;">
                          <tr><td align="center" style="font-size:18px;">✓</td></tr>
                        </table>
                        <div style="font-size:12px;color:#666;padding-top:8px;">First Order</div>
                      </td>
                      <td align="center" width="120">
                        <table width="42" height="42" cellpadding="0" cellspacing="0" bgcolor="#0D3B2E" style="border-radius:21px;">
                          <tr><td align="center" style="font-size:18px;color:#FFFFFF;">🚚</td></tr>
                        </table>
                        <div style="font-size:12px;color:#0D3B2E;font-weight:bold;padding-top:8px;">Shipped</div>
                      </td>
                      <td align="center" width="120">
                        <table width="34" height="34" cellpadding="0" cellspacing="0" bgcolor="#EFEFEF" style="border-radius:17px;">
                          <tr><td align="center" style="font-size:18px;">📦</td></tr>
                        </table>
                        <div style="font-size:12px;color:#999;padding-top:8px;">Delivered</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td align="center" style="padding:10px 35px;font-family:Georgia,serif;">
                  <div style="font-size:34px;color:#222;font-weight:bold;">
                    Order #${orderId}
                  </div>
                  <div style="font-size:34px;color:#222;">
                    has been shipped.
                  </div>
                </td>
              </tr>

              <!-- Message -->
              <tr>
                <td style="padding:20px 40px;font-family:Arial,sans-serif;color:#444;font-size:15px;line-height:24px;">
                  <strong>Hello ${customerName},</strong><br><br>
                  Great! Your order has been marked as shipped. Here are the details.
                </td>
              </tr>

              <!-- Vendor Products Section -->
              <tr>
                <td style="padding:0 40px 25px;">
                  <table width="100%" cellpadding="10" cellspacing="0" border="0" style="border:1px solid #E6E2D8;border-radius:8px;">
                    <tr>
                      <td colspan="4" style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#8A7D68;background:#FCFAF7;padding:10px;">
                        PRODUCTS FROM ${vendor?.shopName || vendor?.name || "Vendor"}
                      </td>
                    </tr>
                    <tr>
                      <th style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:8px;text-align:left;border-bottom:1px solid #ddd;">Product</th>
                      <th style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:8px;text-align:center;border-bottom:1px solid #ddd;">Qty</th>
                      <th style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:8px;text-align:right;border-bottom:1px solid #ddd;">Price</th>
                      <th style="font-family:Arial,sans-serif;font-size:12px;color:#666;padding:8px;text-align:right;border-bottom:1px solid #ddd;">Total</th>
                    </tr>
                    ${itemsList}
                    <tr>
                      <td colspan="3" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;padding:10px;text-align:right;">Total</td>
                      <td style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0D3B2E;padding:10px;text-align:right;">₹${vendorTotal.toFixed(2)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Box -->
              <tr>
                <td style="padding:0 40px 25px;">
                  <table width="100%" cellpadding="10" cellspacing="0" border="0" bgcolor="#FCFAF7" style="border:1px solid #E6E2D8;border-radius:8px;">
                    <tr>
                      <td colspan="2" style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#8A7D68;">
                        SHIPPING DETAILS
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Courier</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.courier || 'Delhivery'}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Tracking ID</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.trackingId || '1234567890'}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Customer Info -->
              <tr>
                <td style="padding:0 40px 25px;">
                  <table width="100%" cellpadding="10" cellspacing="0" border="0" bgcolor="#FCFAF7" style="border:1px solid #E6E2D8;border-radius:8px;">
                    <tr>
                      <td colspan="2" style="font-family:Arial,sans-serif;font-size:12px;font-weight:bold;color:#8A7D68;">
                        CUSTOMER DETAILS
                      </td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Name</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.name || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Phone</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.phone || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Address</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.address || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">City</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.city || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">State</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.state || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style="font-family:Arial,sans-serif;font-size:14px;color:#666;">Pincode</td>
                      <td align="right" style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#222;">${order.shippingAddress?.pincode || "N/A"}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Button -->
              <tr>
                <td align="center" style="padding-bottom:30px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td bgcolor="#0D3B2E" style="border-radius:6px;">
                        <a href="${process.env.FRONTEND_URL || 'https://native91.com'}/vendor/orders/${orderId}"
                           style="display:inline-block;padding:14px 40px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;">
                          VIEW ORDER →
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding:20px;border-top:1px solid #EEEEEE;font-family:Arial,sans-serif;">
                  <div style="font-size:15px;color:#555;">Need help? We're here for you.</div>
                  <div style="padding-top:8px;font-size:14px;">
                    <a href="mailto:support@native91.com" style="color:#0D3B2E;text-decoration:none;">
                      support@native91.com
                    </a>
                  </div>
                  <div style="padding-top:18px;font-size:20px;">
                    📷 &nbsp; 💼 &nbsp; ✉️
                  </div>
                  <div style="padding-top:15px;font-size:12px;color:#999;">
                    © ${new Date().getFullYear()} Native91. All rights reserved.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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