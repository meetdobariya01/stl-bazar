// Router/sellerRoutes.js - COMPLETE WITH OTP SUPPORT (TRACKING EMAIL AFTER OTP)

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Seller = require("../Models/Seller");
const Vendor = require("../Models/Vendor");
const Company = require("../Models/Company");
const { sendOTP, verifyOTP, resendOTP } = require("../utils/otpService");
const nodemailer = require("nodemailer");

// ============================================================
// EMAIL CONFIGURATION
// ============================================================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "brands@native91.com",
    pass: process.env.EMAIL_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// ============================================================
// SEND ADMIN NOTIFICATION EMAIL
// ============================================================
const sendAdminNotificationEmail = async (sellerData) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@native91.com";
  
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
    to: adminEmail,
    subject: `📋 New Seller Application - ${sellerData.businessName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Seller Application</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f2; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: #073f31; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: #e5d6a5; margin: 0; font-family: Georgia, serif; font-weight: normal; }
    .content { padding: 25px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: bold; color: #073f31; font-size: 13px; }
    .value { font-size: 15px; color: #333; margin-top: 2px; padding: 8px 12px; background: #f9fafb; border-radius: 5px; }
    .status-badge { display: inline-block; background: #f39c12; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .button { display: inline-block; background: #073f31; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
    .category-list { display: flex; flex-wrap: wrap; gap: 5px; }
    .category-tag { background: #e8f0fe; padding: 3px 10px; border-radius: 15px; font-size: 12px; color: #073f31; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✦ Native91</h1>
      <p style="color: white; margin: 5px 0 0; font-size: 14px;">New Seller Application</p>
    </div>
    
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #073f31;">${sellerData.businessName}</h2>
        <span class="status-badge">PENDING REVIEW</span>
      </div>
      
      <div class="field">
        <div class="label">📛 Full Name</div>
        <div class="value">${sellerData.fullName}</div>
      </div>
      
      <div class="field">
        <div class="label">📧 Email Address</div>
        <div class="value">${sellerData.email}</div>
      </div>
      
      <div class="field">
        <div class="label">📱 Phone Number</div>
        <div class="value">${sellerData.phoneNumber}</div>
      </div>
      
      <div class="field">
        <div class="label">🏷️ Business / Brand Name</div>
        <div class="value">${sellerData.businessName}</div>
      </div>
      
      <div class="field">
        <div class="label">🌐 Website / Social Media</div>
        <div class="value">${sellerData.website || 'Not provided'}</div>
      </div>
      
      <div class="field">
        <div class="label">📦 Categories</div>
        <div class="value">
          <div class="category-list">
            ${sellerData.category.split(',').map(cat => `<span class="category-tag">${cat.trim()}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="field">
        <div class="label">💎 Pricing Plan</div>
        <div class="value">${sellerData.pricingPlan || 'Not selected'}</div>
      </div>
      
      <div class="field">
        <div class="label">🆔 Tracking ID</div>
        <div class="value">${sellerData.trackingId}</div>
      </div>
      
      <div class="field">
        <div class="label">📅 Registered At</div>
        <div class="value">${new Date(sellerData.registeredAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
      </div>
      
      <div class="field">
        <div class="label">✅ Phone Verified</div>
        <div class="value">${sellerData.phoneVerified ? 'Yes' : 'No'}</div>
      </div>
      
      <hr style="margin: 20px 0; border-color: #eee;">
      
      <div style="text-align: center;">
        <a href="${process.env.ADMIN_URL || 'https://admin.native91.com'}/seller-applications" class="button">
          View All Applications →
        </a>
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated notification. Please review the application in the admin panel.</p>
      <p>&copy; ${new Date().getFullYear()} Native91. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

// ============================================================
// SEND TRACKING EMAIL (After OTP Verification)
// ============================================================
const sendTrackingEmail = async (sellerData, trackingUrl) => {
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
    to: sellerData.email,
    subject: "Your Native91 Seller Application - Tracking Link",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native91 Application Status</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f5f2;
      font-family: Arial, Helvetica, sans-serif;
      color: #30342f;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    img {
      border: 0;
      display: block;
      max-width: 100%;
    }
    a {
      text-decoration: none;
    }
    .email-wrapper {
      width: 100%;
      padding: 30px 15px;
      background-color: #f5f5f2;
    }
    .email-container {
      width: 100%;
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e8e5dc;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #073f31;
      padding: 25px 20px;
      text-align: center;
      position: relative;
    }
    .brand-name {
      color: #e5d6a5;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 23px;
      letter-spacing: 5px;
      margin: 0;
      font-weight: normal;
    }
    .brand-subtitle {
      color: #ffffff;
      font-size: 9px;
      letter-spacing: 1.5px;
      margin-top: 4px;
      text-transform: uppercase;
    }
    .leaf-decoration {
      color: #b39b63;
      font-size: 35px;
      line-height: 20px;
      text-align: right;
      margin-top: -20px;
      margin-right: 10px;
    }
    .progress-section {
      padding: 22px 30px 10px;
      background-color: #ffffff;
    }
    .progress-item {
      width: 33.33%;
      text-align: center;
      vertical-align: top;
      position: relative;
    }
    .progress-circle {
      width: 36px;
      height: 36px;
      margin: 0 auto 7px;
      border-radius: 50%;
      background-color: #f7f7f3;
      border: 1px solid #d5d2c8;
      text-align: center;
      line-height: 36px;
      font-size: 17px;
      color: #a7a79e;
      position: relative;
      z-index: 2;
    }
    .progress-circle.active {
      background-color: #073f31;
      border-color: #073f31;
      color: #ffffff;
    }
    .progress-label {
      font-size: 10px;
      color: #343833;
      white-space: nowrap;
    }
    .content {
      padding: 10px 35px 25px;
    }
    .main-title {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 25px;
      line-height: 1.25;
      font-weight: normal;
      color: #26362f;
      text-align: center;
      margin: 5px 0 20px;
    }
    .greeting {
      font-size: 13px;
      color: #333631;
      margin: 0 0 12px;
    }
    .paragraph {
      font-size: 12px;
      line-height: 1.65;
      color: #50534e;
      margin: 0 0 12px;
    }
    .gold {
      color: #987d4e;
      font-weight: bold;
    }
    .application-box {
      background-color: #faf9f5;
      border: 1px solid #eeeae0;
      border-radius: 7px;
      padding: 16px 15px;
      margin: 18px 0 15px;
      text-align: center;
    }
    .application-label {
      font-size: 9px;
      color: #74766f;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .application-id {
      font-size: 16px;
      color: #333631;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .status-label {
      font-size: 9px;
      color: #74766f;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .status {
      font-family: Georgia, "Times New Roman", serif;
      color: #987d4e;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    .track-text {
      text-align: center;
      font-size: 10px;
      color: #60625c;
      margin: 12px 0;
    }
    .track-button {
      display: inline-block;
      background-color: #073f31;
      color: #ffffff !important;
      padding: 11px 20px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .arrow {
      color: #d8c48e;
      font-size: 15px;
      padding-left: 8px;
    }
    .social-section {
      text-align: center;
      padding: 12px 0 5px;
    }
    .social-icon {
      display: inline-block;
      width: 25px;
      height: 25px;
      line-height: 25px;
      border: 1px solid #d8d5cc;
      border-radius: 50%;
      color: #70736c;
      font-size: 11px;
      margin: 0 5px;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding: 5px 25px 20px;
      font-size: 9px;
      color: #999b94;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 10px 8px; }
      .email-container { width: 100% !important; }
      .header { padding: 22px 15px; }
      .brand-name { font-size: 21px; }
      .content { padding: 10px 22px 22px; }
      .main-title { font-size: 23px; }
      .progress-section { padding-left: 15px; padding-right: 15px; }
      .progress-label { font-size: 9px; }
      .application-box { padding: 15px 10px; }
      .track-button { padding: 11px 16px; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="email-wrapper">
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" align="center">
          <tr>
            <td class="header">
              <div class="brand-name">NATIVE91</div>
              <div class="brand-subtitle">RESERVED FOR THE REMARKABLE</div>
              <div class="leaf-decoration">❧</div>
            </td>
          </tr>
          <tr>
            <td class="progress-section">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="progress-item">
                    <div class="progress-circle active">✓</div>
                    <div class="progress-label">Received</div>
                  </td>
                  <td class="progress-item">
                    <div class="progress-circle">♙</div>
                    <div class="progress-label">Under Review</div>
                  </td>
                  <td class="progress-item">
                    <div class="progress-circle">◇</div>
                    <div class="progress-label">Decision</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h1 class="main-title">Your Native91<br>application is in.</h1>
              <p class="greeting">Hello ${sellerData.fullName},</p>
              <p class="paragraph">Thank you for your interest in becoming a <span class="gold">Native91 Founding Brand.</span></p>
              <p class="paragraph">We've received your application and our curation team will now review your brand, products and overall fit with the Native91 community.</p>
              <div class="application-box">
                <div class="application-label">Application ID</div>
                <div class="application-id">${sellerData.trackingId}</div>
                <div class="status-label">Status</div>
                <div class="status">UNDER REVIEW</div>
              </div>
              <p class="track-text">You can track your application status anytime.</p>
              <div style="text-align:center;">
                <a href="${trackingUrl}" class="track-button" target="_blank">
                  Track Application Status <span class="arrow">→</span>
                </a>
              </div>
              <div class="social-section">
                <a href="#" class="social-icon">◎</a>
                <a href="#" class="social-icon">in</a>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <div style="margin-bottom:4px;">This is an automated email. Please do not reply to this message.</div>
              © ${new Date().getFullYear()} Native91. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// ============================================================
// SEND REJECTION EMAIL
// ============================================================
const sendRejectionEmail = async (sellerData, reason) => {
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
    to: sellerData.email,
    subject: "📋 Your Native91 Seller Application Status Update",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Application Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #e74c3c; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: #fdf0f0; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>📋 Application Status Update</h1></div>
          <div class="content">
            <h2>Hello ${sellerData.fullName},</h2>
            <p>We have reviewed your seller application for <strong>Native91</strong>.</p>
            <p style="font-size: 18px; color: #e74c3c; font-weight: bold;">Status: Rejected</p>
            ${reason ? `
              <div class="reason-box">
                <p><strong>Reason for rejection:</strong></p>
                <p>${reason}</p>
              </div>
            ` : ''}
            <p>We appreciate your interest in joining Native91.</p>
            <p>You can reapply after 30 days if you wish.</p>
            <hr>
            <p style="font-size: 14px;">Best regards,<br><strong>Native91 Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Native91. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// ============================================================
// ✅ REGISTER SELLER (with OTP only - NO tracking email yet)
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phoneNumber, 
      businessName, 
      category, 
      website,
      pricingPlan 
    } = req.body;

    console.log('📝 Registration request received:', { email, businessName });

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !businessName || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Handle category - if array, convert to string
    let categoryString = category;
    if (Array.isArray(category)) {
      categoryString = category.join(', ');
      console.log('🔄 Category converted from array to string:', categoryString);
    }

    // Check if email already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    // Generate tracking token
    const trackingToken = crypto.randomBytes(32).toString('hex');
    const trackingTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    // Create seller
    const seller = new Seller({
      fullName,
      email,
      phoneNumber,
      businessName,
      category: categoryString,
      website: website || '',
      pricingPlan: pricingPlan || '',
      status: 'pending',
      trackingToken,
      trackingTokenExpires,
      phoneVerified: false,
    });

    await seller.save();
    console.log(`✅ Seller created: ${seller._id}`);

    // ========================================================
    // SEND ADMIN NOTIFICATION ONLY (No tracking email yet)
    // ========================================================
    try {
      await sendAdminNotificationEmail(seller);
      console.log(`✅ Admin notification email sent for: ${seller.businessName}`);
    } catch (adminEmailErr) {
      console.error("❌ Admin email error:", adminEmailErr);
    }

    // ========================================================
    // SEND OTP
    // ========================================================
    let otpResult = null;
    try {
      otpResult = await sendOTP(seller._id);
      console.log(`📱 OTP send result: ${otpResult.success ? 'Success' : 'Failed'}`);
    } catch (otpErr) {
      console.error("❌ OTP send error:", otpErr);
    }

    // Return response (NO tracking email sent yet)
    res.status(201).json({
      success: true,
      message: "Registration successful! Please verify your phone number via OTP.",
      data: {
        sellerId: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        businessName: seller.businessName,
        trackingId: seller.trackingId,
        phoneVerified: seller.phoneVerified,
        otpSent: otpResult?.success || false,
        ...(process.env.NODE_ENV === 'development' && otpResult?.otp && { otp: otpResult.otp }),
      },
    });

  } catch (error) {
    console.error("❌ Seller registration error:", error);
    res.status(500).json({
      success: false,
      message: error.code === 11000
        ? "This email is already registered"
        : "Failed to register. Please try again.",
      error: error.message,
    });
  }
});

// ============================================================
// ✅ VERIFY OTP (Sends tracking email after successful verification)
// ============================================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { sellerId, otp } = req.body;

    if (!sellerId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and OTP are required",
      });
    }

    const result = await verifyOTP(sellerId, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // ========================================================
    // ✅ OTP VERIFIED - NOW SEND TRACKING EMAIL
    // ========================================================
    try {
      // Fetch updated seller data
      const seller = await Seller.findById(sellerId);
      
      if (seller) {
        // Generate tracking URL
        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/application-status/${seller.trackingId}?token=${seller.trackingToken}`;
        
        // Send tracking email
        await sendTrackingEmail(seller, trackingUrl);
        console.log(`✅ Tracking email sent to seller after OTP verification: ${seller.email}`);
      }
    } catch (trackingErr) {
      console.error("❌ Tracking email error after OTP verification:", trackingErr);
      // Don't fail the verification if tracking email fails
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        ...result.data,
        trackingEmailSent: true,
      },
    });

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
});

// ============================================================
// ✅ REQUEST OTP
// ============================================================
router.post("/request-otp", async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const result = await sendOTP(sellerId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: "OTP sent to your email!",
      ...(process.env.NODE_ENV === 'development' && { otp: result.otp }),
    });

  } catch (error) {
    console.error("❌ Request OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
});

// ============================================================
// ✅ RESEND OTP
// ============================================================
router.post("/resend-otp", async (req, res) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const result = await resendOTP(sellerId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: "OTP resent to your email!",
      ...(process.env.NODE_ENV === 'development' && { otp: result.otp }),
    });

  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP",
    });
  }
});

// ============================================================
// ✅ STATUS CHECK (with OTP status)
// ============================================================
router.get("/status/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { token } = req.query;

    console.log(`🔍 Status check request: ${trackingId}`);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Tracking token is required",
      });
    }

    const seller = await Seller.findOne({
      trackingId: trackingId,
      trackingToken: token,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Invalid tracking ID or token",
      });
    }

    if (seller.trackingTokenExpires && new Date(seller.trackingTokenExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Tracking link has expired. Please contact support.",
      });
    }

    const response = {
      success: true,
      data: {
        trackingId: seller.trackingId,
        fullName: seller.fullName,
        businessName: seller.businessName,
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        category: seller.category,
        website: seller.website || '',
        pricingPlan: seller.pricingPlan || '',
        status: seller.status,
        phoneVerified: seller.phoneVerified,
        registeredAt: seller.registeredAt,
        updatedAt: seller.updatedAt,
      },
    };

    if (seller.status === 'rejected' && seller.rejectionReason) {
      response.data.rejectionReason = seller.rejectionReason;
    }

    if (seller.status === 'approved' && seller.vendorId) {
      const vendor = await Vendor.findById(seller.vendorId).select('company status');
      if (vendor) {
        response.data.vendor = {
          company: vendor.company,
          status: vendor.status,
        };
      }
    }

    res.json(response);

  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check application status",
    });
  }
});

// ============================================================
// ADMIN: GET ALL APPLICATIONS
// ============================================================
router.get("/applications", async (req, res) => {
  try {
    const applications = await Seller.find()
      .sort({ registeredAt: -1 })
      .select('-trackingToken -trackingTokenExpires -otpCode -otpExpires -otpAttempts -otpLastRequested');

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Fetch applications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
});

// ============================================================
// ADMIN: GET SINGLE APPLICATION
// ============================================================
router.get("/applications/:id", async (req, res) => {
  try {
    const application = await Seller.findById(req.params.id)
      .select('-trackingToken -trackingTokenExpires -otpCode -otpExpires -otpAttempts -otpLastRequested');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Fetch application error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
});

// ============================================================
// ADMIN: APPROVE APPLICATION
// ============================================================
router.post("/applications/:id/approve", async (req, res) => {
  try {
    const { notes } = req.body;
    const application = await Seller.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    // Optional: Check if phone is verified before approval
    // if (!application.phoneVerified) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Phone number must be verified before approval",
    //   });
    // }

    // Create or get company
    let company = await Company.findOne({ name: application.businessName });
    if (!company) {
      company = await Company.create({
        name: application.businessName,
        description: `Company for ${application.businessName}`,
        status: 'active',
      });
    }

    // Generate random password for vendor account
    const tempPassword = crypto.randomBytes(10).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create vendor account
    const vendor = new Vendor({
      name: application.fullName,
      email: application.email,
      password: hashedPassword,
      role: 'vendor',
      phone: application.phoneNumber,
      company: application.businessName,
      status: 'active',
      plan: 'founding',
      planName: 'Founding 100',
      commissionRate: 0,
      planUpdatedAt: new Date(),
      totalOrders: 0,
    });

    await vendor.save();

    // Update application
    application.status = 'approved';
    application.reviewedAt = new Date();
    application.adminNotes = notes || 'Application approved';
    application.vendorId = vendor._id;
    await application.save();

    console.log(`✅ Application approved for: ${application.email}`);
    console.log(`✅ Vendor created: ${vendor._id}`);

    res.json({
      success: true,
      message: "Application approved and vendor account created!",
      data: {
        vendorId: vendor._id,
        vendorEmail: vendor.email,
        vendorCompany: vendor.company,
        trackingId: application.trackingId,
        phoneVerified: application.phoneVerified,
      },
    });

  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve application",
    });
  }
});

// ============================================================
// ADMIN: REJECT APPLICATION
// ============================================================
router.post("/applications/:id/reject", async (req, res) => {
  try {
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const application = await Seller.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`,
      });
    }

    application.status = 'rejected';
    application.reviewedAt = new Date();
    application.rejectionReason = reason;
    application.adminNotes = notes || reason;
    await application.save();

    // Send rejection email
    try {
      await sendRejectionEmail(application, reason);
      console.log(`✅ Rejection email sent to ${application.email}`);
    } catch (emailErr) {
      console.error("❌ Rejection email error:", emailErr);
    }

    res.json({
      success: true,
      message: "Application rejected successfully",
    });

  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject application",
    });
  }
});

// ============================================================
// GET STATISTICS
// ============================================================
router.get("/stats", async (req, res) => {
  try {
    const total = await Seller.countDocuments();
    const pending = await Seller.countDocuments({ status: 'pending' });
    const approved = await Seller.countDocuments({ status: 'approved' });
    const rejected = await Seller.countDocuments({ status: 'rejected' });
    const verified = await Seller.countDocuments({ phoneVerified: true });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        phoneVerified: verified,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

// ============================================================
// TEST ROUTE
// ============================================================
router.get("/test", (req, res) => {
  res.json({ message: "Seller routes are working!" });
});

module.exports = router;