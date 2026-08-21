// Router/sellerRoutes.js - UPDATED APPROVE ROUTE (NO CREDENTIALS EMAIL)

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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Native91 Application Status</title>

  <style>
    /* =========================
       EMAIL RESET
    ========================== */
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

    /* =========================
       MAIN CONTAINER
    ========================== */
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

    /* =========================
       HEADER
    ========================== */
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

    /* =========================
       PROGRESS SECTION
    ========================== */
    .progress-section {
      padding: 22px 30px 10px;
      background-color: #ffffff;
    }

    .progress-line {
      height: 1px;
      background-color: #d9d7cf;
      position: relative;
      top: 18px;
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

    /* =========================
       CONTENT
    ========================== */
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

    /* =========================
       APPLICATION BOX
    ========================== */
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

    /* =========================
       TRACK BUTTON
    ========================== */
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

    /* =========================
       SUPPORT
    ========================== */
    .support {
      text-align: center;
      margin-top: 17px;
      padding-top: 15px;
      border-top: 1px solid #eeeae0;
    }

    .support-title {
      font-size: 10px;
      color: #74766f;
      margin-bottom: 5px;
    }

    .support-email {
      font-size: 11px;
      color: #073f31;
      font-weight: bold;
    }

    /* =========================
       SOCIAL ICONS
    ========================== */
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

    /* =========================
       FOOTER
    ========================== */
    .footer {
      text-align: center;
      padding: 5px 25px 20px;
      font-size: 9px;
      color: #999b94;
    }

    /* =========================
       MOBILE
    ========================== */
    @media only screen and (max-width: 600px) {

      .email-wrapper {
        padding: 10px 8px;
      }

      .email-container {
        width: 100% !important;
      }

      .header {
        padding: 22px 15px;
      }

      .brand-name {
        font-size: 21px;
      }

      .content {
        padding: 10px 22px 22px;
      }

      .main-title {
        font-size: 23px;
      }

      .progress-section {
        padding-left: 15px;
        padding-right: 15px;
      }

      .progress-label {
        font-size: 9px;
      }

      .application-box {
        padding: 15px 10px;
      }

      .track-button {
        padding: 11px 16px;
      }
    }
  </style>
</head>

<body>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td class="email-wrapper">

        <!-- MAIN EMAIL -->
        <table
          role="presentation"
          class="email-container"
          cellpadding="0"
          cellspacing="0"
          border="0"
          align="center"
        >

          <!-- ================= HEADER ================= -->
          <tr>
            <td class="header">

              <div class="brand-name">
                NATIVE91
              </div>

              <div class="brand-subtitle">
                RESERVED FOR THE REMARKABLE
              </div>

              <div class="leaf-decoration">
                ❧
              </div>

            </td>
          </tr>


          <!-- ================= PROGRESS ================= -->
          <tr>
            <td class="progress-section">

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >

                <tr>

                  <!-- RECEIVED -->
                  <td class="progress-item">

                    <div class="progress-circle active">
                      ✓
                    </div>

                    <div class="progress-label">
                      Received
                    </div>

                  </td>


                  <!-- UNDER REVIEW -->
                  <td class="progress-item">

                    <div class="progress-circle">
                      ♙
                    </div>

                    <div class="progress-label">
                      Under Review
                    </div>

                  </td>


                  <!-- DECISION -->
                  <td class="progress-item">

                    <div class="progress-circle">
                      ◇
                    </div>

                    <div class="progress-label">
                      Decision
                    </div>

                  </td>

                </tr>

              </table>

            </td>
          </tr>


          <!-- ================= CONTENT ================= -->
          <tr>
            <td class="content">

              <h1 class="main-title">
                Your Native91<br>
                application is in.
              </h1>


              <p class="greeting">
                Hello ${sellerData.fullName},
              </p>


              <p class="paragraph">
                Thank you for your interest in becoming a
                <span class="gold">Native91 Founding Brand.</span>
              </p>


              <p class="paragraph">
                We've received your application and our
                curation team will now review your brand,
                products and overall fit with the Native91
                community.
              </p>


              <!-- APPLICATION STATUS -->
              <div class="application-box">

                <div class="application-label">
                  Application ID
                </div>

                <div class="application-id">
                  ${sellerData.trackingId}
                </div>

                <div class="status-label">
                  Status
                </div>

                <div class="status">
                  UNDER REVIEW
                </div>

              </div>


              <!-- TRACK STATUS -->
              <p class="track-text">
                You can track your application status anytime.
              </p>


              <div style="text-align:center;">

                <a
                  href="${trackingUrl}"
                  class="track-button"
                  target="_blank"
                >
                  Track Application Status
                  <span class="arrow">→</span>
                </a>

              </div>


             

              <!-- SOCIAL -->
              <div class="social-section">

                <a href="#" class="social-icon">
                  ◎
                </a>

                <a href="#" class="social-icon">
                  in
                </a>

               

              </div>

            </td>
          </tr>


          <!-- ================= FOOTER ================= -->
          <tr>
            <td class="footer">
              <div style="margin-bottom:4px;">
                This is an automated email. Please do not reply to this message.
              </div>
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
// ✅ SEND REJECTION EMAIL ONLY (NO CREDENTIALS)
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
// ✅ REGISTER SELLER (with tracking)
// ============================================================
router.post("/register", async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phoneNumber, 
      businessName, 
      category,
      website,        // ✅ NEW
      pricingPlan     // ✅ NEW
    } = req.body;

    // Validate required fields
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
      website: website || '',           // ✅ NEW
      pricingPlan: pricingPlan || '',   // ✅ NEW
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
        website: seller.website,
        pricingPlan: seller.pricingPlan,
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
// ============================================================
// ✅ PUBLIC: CHECK APPLICATION STATUS - UPDATED
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
        category: seller.category,
        website: seller.website || '',           // ✅ NEW
        pricingPlan: seller.pricingPlan || '',   // ✅ NEW
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
// ✅ ADMIN: APPROVE APPLICATION - NO EMAIL (Frontend handles it)
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

    // ========================================================
    // ⚠️ IMPORTANT: NO EMAIL SENT HERE!
    // The frontend will handle sending the approval email
    // via /send-approval-email endpoint on port 5001
    // ========================================================
    console.log(`✅ Application approved for: ${application.email}`);
    console.log(`✅ Vendor created: ${vendor._id}`);
    console.log(`📧 NO EMAIL SENT - Frontend will handle it`);

    res.json({
      success: true,
      message: "Application approved and vendor account created!",
      data: {
        vendorId: vendor._id,
        vendorEmail: vendor.email,
        vendorCompany: vendor.company,
        trackingId: application.trackingId,
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