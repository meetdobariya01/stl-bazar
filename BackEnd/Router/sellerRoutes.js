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
<title>Native91 - Application Under Review</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #f4f3f0;
    color: #101719;
    font-family: Georgia, "Times New Roman", serif;
  }

  .email {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    background: #fff;
    overflow: hidden;
  }

  .hero {
    height: 200px;
    background: #11231e;
    color: #eee6d4;
    position: relative;
    overflow: hidden;
    padding: 58px 70px;
  }

  .brand {
    font-size: 58px;
    line-height: 1;
    letter-spacing: 7px;
    font-weight: 500;
    margin: 0;
  }

  .tagline {
    margin: 14px 0 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 15px;
    letter-spacing: 4px;
  }

  .leaves {
    position: absolute;
    right: -5px;
    top: -25px;
    width: 230px;
    height: 225px;
    opacity: .42;
  }

  .content {
    padding: 64px 86px 40px;
  }

  h1 {
    font-size: 42px;
    font-weight: 500;
    margin: 0 0 30px;
  }

  .intro {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 20px;
    line-height: 1.8;
    margin: 0 0 22px;
  }

  .gold { color: #96783f; font-weight: 700; }

  .details {
    margin: 40px 0 48px;
    padding: 40px 28px;
    background: #faf8f4;
    border-radius: 12px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .detail {
    text-align: center;
    min-height: 145px;
    padding: 0 18px;
    border-right: 1px solid #e1ddd5;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .detail:last-child { border-right: 0; }

  .icon {
    width: 46px;
    height: 46px;
    margin-bottom: 16px;
    color: #17312a;
  }

  .label {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    letter-spacing: .5px;
    margin-bottom: 20px;
  }

  .value {
    font-size: 25px;
    font-weight: 600;
    line-height: 1.25;
  }

  .value.status {
    color: #96783f;
    font-size: 21px;
  }

  .next {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 28px;
    align-items: center;
    margin: 0 auto 44px;
    max-width: 760px;
  }

  .people {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f5f0e7;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .next h2 {
    margin: 0 0 10px;
    color: #96783f;
    font-size: 23px;
    letter-spacing: .5px;
  }

  .next p {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 19px;
    line-height: 1.6;
  }

  .track {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 19px;
    line-height: 1.6;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 22px;
    margin-top: 18px;
    width: 415px;
    max-width: 100%;
    min-height: 70px;
    background: #10231e;
    color: white;
    text-decoration: none;
    border-radius: 7px;
    font-size: 17px;
    letter-spacing: 1px;
  }

  .arrow { font-size: 28px; line-height: 1; }

  .divider {
    width: 415px;
    max-width: 100%;
    margin: 13px auto 10px;
    border-top: 1px solid #ded9cf;
    position: relative;
  }

  .divider span {
    position: relative;
    top: -12px;
    padding: 0 12px;
    background: #fff;
    color: #96783f;
    font-size: 25px;
  }

  .timing {
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 19px;
    line-height: 1.7;
    margin: 0 auto 26px;
  }

  .closing {
    text-align: center;
    color: #96783f;
    font-size: 25px;
    font-weight: 600;
    margin: 0 0 48px;
  }

  .regards {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
    line-height: 1.8;
    margin-bottom: 8px;
  }

  .team {
    font-weight: 700;
    font-size: 20px;
  }

  .reserved {
    color: #96783f;
    font-family: Georgia, serif;
    font-style: italic;
  }

  footer {
    border-top: 1px solid #ddd;
    text-align: center;
    padding: 28px 20px 34px;
    color: #6d6d6d;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
  }

  .social {
    display: inline-flex;
    gap: 16px;
    margin-left: 16px;
    vertical-align: middle;
  }

  .social a {
    width: 38px;
    height: 38px;
    border: 1px solid #9c9c9c;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #17312a;
    text-decoration: none;
  }

  @media (max-width: 700px) {
    .hero { height: 160px; padding: 45px 28px; }
    .brand { font-size: 38px; letter-spacing: 4px; }
    .tagline { font-size: 10px; letter-spacing: 2.5px; }
    .leaves { width: 150px; opacity: .25; }
    .content { padding: 40px 24px 30px; }
    h1 { font-size: 34px; }
    .intro { font-size: 17px; }
    .details { grid-template-columns: 1fr 1fr; gap: 30px 0; padding: 28px 10px; }
    .detail:nth-child(2) { border-right: 0; }
    .next { grid-template-columns: 1fr; text-align: center; }
    .people { margin: 0 auto; }
    .next h2 { font-size: 21px; }
    .next p, .track, .timing { font-size: 16px; }
    .closing { font-size: 21px; }
    footer { font-size: 13px; }
  }

  @media (max-width: 430px) {
    .details { grid-template-columns: 1fr; }
    .detail { border-right: 0; border-bottom: 1px solid #e1ddd5; padding: 20px 10px; }
    .detail:last-child { border-bottom: 0; }
  }
</style>
</head>

<body>
<div class="email">

  <header class="hero">
    <div class="brand">NATIVE91</div>
    <div class="tagline">RESERVED FOR THE REMARKABLE</div>

    <svg class="leaves" viewBox="0 0 230 225" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#aa8d55" stroke-width="1.2">
        <path d="M98 225C110 168 126 102 176 0"/>
        <path d="M125 128C100 105 84 78 87 50C111 66 126 91 125 128Z"/>
        <path d="M142 92C166 76 183 54 185 28C159 39 143 61 142 92Z"/>
        <path d="M119 151C89 145 65 129 55 104C82 107 106 123 119 151Z"/>
        <path d="M158 58C174 37 194 24 218 25C206 49 184 62 158 58Z"/>
        <path d="M168 36C167 19 172 6 184 -8C193 12 188 29 168 36Z"/>
        <path d="M147 99C173 99 197 90 211 71C185 68 162 77 147 99Z"/>
        <path d="M126 176C153 168 177 151 185 128C158 132 138 148 126 176Z"/>
        <path d="M108 199C82 194 60 181 48 159C73 160 95 174 108 199Z"/>
      </g>
    </svg>
  </header>

  <main class="content">
    <h1>Hello Nirzari,</h1>

    <p class="intro">
      Thank you for your interest in becoming a
      <span class="gold">Native91 Founding Brand.</span>
    </p>

    <p class="intro">
      We’ve received your application and our curation team will now review
      your brand, products and overall fit with the Native91 community.
    </p>

    <section class="details">
      <div class="detail">
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M13 5h16l10 10v28H13z"/>
          <path d="M29 5v11h10M19 24h14M19 30h14M19 36h9"/>
        </svg>
        <div class="label">APPLICATION ID</div>
        <div class="value">APP-53647</div>
      </div>

      <div class="detail">
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="24" cy="24" r="18"/>
          <path d="M24 12v20M18 26l6 6 6-6"/>
        </svg>
        <div class="label">STATUS</div>
        <div class="value status">UNDER REVIEW</div>
      </div>

      <div class="detail">
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M7 24l17-17h15v15L22 39z"/>
          <circle cx="32" cy="15" r="2"/>
        </svg>
        <div class="label">BRAND</div>
        <div class="value">Brandel</div>
      </div>

      <div class="detail">
        <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8">
          <rect x="7" y="7" width="14" height="14" rx="3"/>
          <rect x="27" y="7" width="14" height="14" rx="3"/>
          <rect x="7" y="27" width="14" height="14" rx="3"/>
          <rect x="27" y="27" width="14" height="14" rx="3"/>
        </svg>
        <div class="label">CATEGORY</div>
        <div class="value">Handmade<br>Home Decor</div>
      </div>
    </section>

    <section class="next">
      <div class="people">
        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" stroke="#17312a" stroke-width="1.7">
          <circle cx="33" cy="21" r="8"/>
          <path d="M18 48c0-9 6-15 15-15s15 6 15 15"/>
          <circle cx="14" cy="27" r="6"/>
          <path d="M3 48c0-7 4-12 11-12 4 0 7 2 9 5"/>
          <circle cx="52" cy="27" r="6"/>
          <path d="M62 48c0-7-4-12-11-12-4 0-7 2-9 5"/>
        </svg>
      </div>

      <div>
        <h2>WHAT HAPPENS NEXT?</h2>
        <p>Our team carefully reviews every application to maintain the quality and character of the Native91 marketplace.</p>
      </div>
    </section>

    <div class="track">
      You can check your application status at any time.<br>
      <a href="#" class="button">
        TRACK APPLICATION STATUS
        <span class="arrow">→</span>
      </a>
    </div>

    <div class="divider"><span>♧</span></div>

    <p class="timing">
      Your review typically takes 24–48 hours. Once the review is complete,<br>
      we’ll email you with the next steps.
    </p>

    <p class="closing">We’re excited to discover what you’ve created.</p>

    <div class="regards">
      Warm regards,<br>
      <span class="team">Team Native91</span><br>
      <span class="reserved">Reserved for the Remarkable.</span>
    </div>
  </main>

  <footer>
    <div>This is an automated email. Please do not reply to this message.</div>
    <div style="margin-top:22px;">
      © 2026 Native91. All rights reserved.
      <span style="margin:0 12px;">|</span>
      <span class="social">
        <a href="#" aria-label="Instagram">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <rect x="3" y="3" width="18" height="18" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1"/>
          </svg>
        </a>
        <a href="#" aria-label="LinkedIn" style="font-family:Arial;font-weight:bold;font-size:16px;">in</a>
        <a href="#" aria-label="Email">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M4 7l8 6 8-6"/>
          </svg>
        </a>
      </span>
    </div>
  </footer>

</div>
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
