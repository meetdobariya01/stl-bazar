const nodemailer = require("nodemailer");

let transporter = null;
let emailMode = "none";

// Initialize email transporter
const initEmailTransporter = async () => {
  // // console.log("📧 Initializing email service...");
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  // Check if we have real email credentials
  if (emailUser && emailPass && emailUser !== "yourstore@gmail.com") {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
      
      await transporter.verify();
      emailMode = "smtp";
      // console.log("✅ SMTP email configured successfully");
      // console.log(`   Sending from: ${emailUser}`);
      return true;
    } catch (error) {
      console.error("❌ SMTP configuration failed:", error.message);
    }
  }
  
  // Fallback to Ethereal for testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    emailMode = "ethereal";
    // console.log("✅ Ethereal email configured (TEST MODE)");
    // console.log("   📧 Test Email Account:");
    // console.log(`   Email: ${testAccount.user}`);
    // console.log(`   Password: ${testAccount.pass}`);
    // console.log("   View emails at: https://ethereal.email/login");
    return true;
  } catch (error) {
    console.error("❌ Failed to configure email:", error.message);
    emailMode = "none";
    return false;
  }
};

// Initialize email on startup
initEmailTransporter();

// Send email function
const sendEmail = async (to, subject, html) => {
  if (!transporter || emailMode === "none") {
    // console.log("⚠️ Email service not available. Email not sent.");
    // console.log(`   Would have sent to: ${to}`);
    // console.log(`   Subject: ${subject}`);
    return { success: false, error: "No email service", previewUrl: null };
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"Gourment Bazar" <${emailMode === "smtp" ? process.env.EMAIL_USER : "noreply@ethereal.email"}>`,
      to,
      subject,
      html,
    });
    
    // console.log(`✅ Email sent to ${to}`);
    
    let previewUrl = null;
    if (emailMode === "ethereal") {
      previewUrl = nodemailer.getTestMessageUrl(info);
    //   console.log(`   📧 Preview: ${previewUrl}`);
    }
    
    return { success: true, info, previewUrl };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message, previewUrl: null };
  }
};

// Email Templates
const getCustomerOrderEmail = (order, orderId) => {
  const itemsList = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #4CAF50; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; padding: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed! 🎉</h1>
        </div>
        <div class="content">
          <h2>Thank you for your order!</h2>
          <p>Dear ${order.shippingAddress?.name || "Customer"},</p>
          <p>Your order has been successfully placed and confirmed.</p>
          
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          
          <h3>Order Items:</h3>
          <table>
            <thead>
              <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>
          
          <div class="total">
            <p><strong>Total Amount: ₹${order.totalPrice}</strong></p>
          </div>
          
          <p>Thank you for shopping with Gourment Bazar!</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getAdminOrderEmail = (order, orderId) => {
  const itemsList = (order.items || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #FF9800; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Received!</h1>
        </div>
        <div class="content">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${order.shippingAddress?.name || "N/A"}</p>
          <p><strong>Email:</strong> ${order.shippingAddress?.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress?.phone || "N/A"}</p>
          <p><strong>Total:</strong> ₹${order.totalPrice}</p>
          <h3>Items:</h3>
          <tr>${itemsList}</tr>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getVendorOrderEmail = (order, orderId, vendorItems, vendor) => {
  const itemsList = (vendorItems || []).map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const vendorTotal = (vendorItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2196F3; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Order Received!</h1>
        </div>
        <div class="content">
          <h2>Dear ${vendor?.shopName || vendor?.name || "Vendor"},</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${order.shippingAddress?.name || "N/A"}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress?.phone || "N/A"}</p>
          <p><strong>Address:</strong> ${order.shippingAddress?.address || "N/A"}</p>
          <p><strong>Your Total:</strong> ₹${vendorTotal}</p>
          <h3>Your Products:</h3>
          <tr>${itemsList}</table>
          <p>Please prepare these items for shipping.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  getCustomerOrderEmail,
  getAdminOrderEmail,
  getVendorOrderEmail,
  emailMode,
};