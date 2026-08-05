// Router/sellerRoutes.js - COMPLETE WITH FIXES

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Seller = require("../Models/Seller");
const Vendor = require("../Models/Vendor");
const Company = require("../Models/Company");
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
// ✅ SEND TRACKING EMAIL
// ============================================================
const sendTrackingEmail = async (sellerData, trackingUrl) => {
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
    to: sellerData.email,
    subject: "Your Native91 Seller Application - Tracking Link",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #2c3e50; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-box { background: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .tracking-id { font-size: 24px; font-weight: bold; color: #2c3e50; letter-spacing: 2px; }
          .button { display: inline-block; padding: 14px 35px; background: #2c3e50; color: white !important; 
                   text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .button:hover { background: #1a252f; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
          .status-badge { display: inline-block; padding: 6px 20px; background: #f39c12; color: white; border-radius: 20px; font-weight: bold; }
          hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Application Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${sellerData.fullName},</h2>
            <p>Thank you for applying to become a seller on <strong>Native91</strong>.</p>
            
            <div class="tracking-box">
              <p style="margin: 0; color: #666;">Your Application ID</p>
              <div class="tracking-id">${sellerData.trackingId}</div>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                <span class="status-badge">${sellerData.status.toUpperCase()}</span>
              </p>
            </div>

            <p>Track your application status anytime using the link below:</p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">📊 Track Application Status</a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
              Or copy and paste this link:<br>
              <span style="word-break: break-all; color: #2c3e50;">${trackingUrl}</span>
            </p>

            <p><strong>Application Details:</strong></p>
            <ul>
              <li><strong>Business Name:</strong> ${sellerData.businessName}</li>
              <li><strong>Email:</strong> ${sellerData.email}</li>
              <li><strong>Phone:</strong> ${sellerData.phoneNumber}</li>
              <li><strong>Category:</strong> ${sellerData.category}</li>
            </ul>

            <hr>
            <p style="font-size: 14px;">Our team will review your application within 24-48 hours.</p>
            <p style="font-size: 14px;">You will receive an email notification once your application is reviewed.</p>
            <hr>
            <p style="font-size: 14px;">Best regards,<br><strong>Native91 Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
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
// ✅ SEND STATUS UPDATE EMAIL
// ============================================================
const sendStatusUpdateEmail = async (sellerData, status, reason = null, loginUrl = null, tempPassword = null) => {
  let subject, htmlContent;

  if (status === 'approved') {
    subject = "🎉 Your Native91 Seller Application is Approved!";
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; }
          .header { background: #27ae60; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 14px 35px; background: #27ae60; color: white !important; 
                   text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
          .credentials { background: #f0f4f8; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .credentials code { background: #e2e8f0; padding: 4px 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>✅ Application Approved!</h1></div>
          <div class="content">
            <h2>Congratulations ${sellerData.fullName}! 🎉</h2>
            <p>Your seller application has been <strong>approved</strong>!</p>
            ${reason ? `<p><strong>Admin Note:</strong> ${reason}</p>` : ''}
            
            <p>Your vendor account has been created. You can now login to your dashboard:</p>
            
            <div class="credentials">
              <p><strong>Login URL:</strong></p>
              <p><a href="${loginUrl}">${loginUrl}</a></p>
              <p><strong>Email:</strong> ${sellerData.email}</p>
              <p><strong>Password:</strong> <code>${tempPassword}</code></p>
              <p style="font-size: 14px; color: #e74c3c;">⚠️ Please change your password after first login.</p>
            </div>

            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">🚀 Go to Dashboard</a>
            </div>

            <p>Welcome to the Native91 seller community!</p>
            <hr>
            <p style="font-size: 14px;">Best regards,<br><strong>Native91 Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Native91. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  } else if (status === 'rejected') {
    subject = "📋 Your Native91 Seller Application Status Update";
    htmlContent = `
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
    `;
  }

  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
    to: sellerData.email,
    subject: subject,
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};

// ============================================================
// ✅ REGISTER SELLER (with tracking)
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, businessName, category } = req.body;

    if (!fullName || !email || !phoneNumber || !businessName || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

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

    const seller = new Seller({
      fullName,
      email,
      phoneNumber,
      businessName,
      category,
      status: 'pending',
      trackingToken,
      trackingTokenExpires,
    });

    await seller.save();

    // Generate tracking URL
    const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/application-status/${seller.trackingId}?token=${trackingToken}`;

    // Send tracking email
    try {
      await sendTrackingEmail(seller, trackingUrl);
      console.log(`✅ Tracking email sent to ${seller.email}`);
    } catch (emailErr) {
      console.error("❌ Email error:", emailErr);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for tracking link.",
      data: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        businessName: seller.businessName,
        status: seller.status,
        trackingId: seller.trackingId,
      },
    });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 
        ? "This email is already registered" 
        : "Failed to register. Please try again.",
    });
  }
});

// ============================================================
// ✅ PUBLIC: CHECK APPLICATION STATUS
// ============================================================
router.get("/status/:trackingId", async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { token } = req.query;

    console.log(`🔍 Status check request:`);
    console.log(`   Tracking ID: ${trackingId}`);
    console.log(`   Token: ${token ? 'Present' : 'Missing'}`);

    if (!token) {
      console.log("❌ Token missing in request");
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
      console.log(`❌ Seller not found for trackingId: ${trackingId}`);
      return res.status(404).json({
        success: false,
        message: "Invalid tracking ID or token",
      });
    }

    console.log(`✅ Seller found: ${seller.email}, Status: ${seller.status}`);

    if (seller.trackingTokenExpires && new Date(seller.trackingTokenExpires) < new Date()) {
      console.log(`❌ Token expired for: ${seller.email}`);
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
        status: seller.status,
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

    if (seller.status !== 'pending' && seller.adminNotes) {
      response.data.adminNotes = seller.adminNotes;
    }

    console.log(`✅ Status response sent for: ${seller.email}`);
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
// ✅ ADMIN: GET ALL APPLICATIONS
// ============================================================
router.get("/applications", async (req, res) => {
  try {
    const applications = await Seller.find()
      .sort({ registeredAt: -1 })
      .select('-trackingToken -trackingTokenExpires');

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
// ✅ ADMIN: GET SINGLE APPLICATION
// ============================================================
router.get("/applications/:id", async (req, res) => {
  try {
    const application = await Seller.findById(req.params.id)
      .select('-trackingToken -trackingTokenExpires');

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
// ✅ ADMIN: APPROVE APPLICATION
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

    // Create or get company
    let company = await Company.findOne({ name: application.businessName });
    if (!company) {
      company = await Company.create({
        name: application.businessName,
        description: `Company for ${application.businessName}`,
        status: 'active',
      });
    }

    // Generate random password
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

    // Send approval email with login credentials
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/login`;
    try {
      await sendStatusUpdateEmail(application, 'approved', notes, loginUrl, tempPassword);
      console.log(`✅ Approval email sent to ${application.email}`);
    } catch (emailErr) {
      console.error("❌ Approval email error:", emailErr);
    }

    res.json({
      success: true,
      message: "Application approved and vendor account created!",
      data: {
        vendorId: vendor._id,
        vendorEmail: vendor.email,
        vendorCompany: vendor.company,
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
// ✅ ADMIN: REJECT APPLICATION
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
      await sendStatusUpdateEmail(application, 'rejected', reason);
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
// ✅ GET STATISTICS
// ============================================================
router.get("/stats", async (req, res) => {
  try {
    const total = await Seller.countDocuments();
    const pending = await Seller.countDocuments({ status: 'pending' });
    const approved = await Seller.countDocuments({ status: 'approved' });
    const rejected = await Seller.countDocuments({ status: 'rejected' });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
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
// ✅ TEST ROUTE
// ============================================================
router.get("/test", (req, res) => {
  res.json({ message: "Seller routes are working!" });
});

module.exports = router;