const express = require("express");
const router = express.Router();
const Ngo = require("../Models/Ngo");
const nodemailer = require("nodemailer");

// Use Hostinger SMTP configured in process.env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "orders@native91.com",
    pass: process.env.EMAIL_PASS || "",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email templates for NGOs
const sendNgoConfirmationEmail = async (ngoData) => {
  const mailOptions = {
    from: `"Native91 Social Impact" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
    to: ngoData.email,
    subject: "Native91 Social Impact Initiative - Partnership Application Received",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #08281f; border-bottom: 2px solid #c8a96b; padding-bottom: 10px;">Application Received! 🎉</h2>
        <p>Dear <strong>${ngoData.fullName}</strong>,</p>
        <p>Thank you for your interest in partnering with the <strong>Native91 Social Impact Initiative</strong>. We are thrilled to connect with organizations creating products with purpose.</p>
        <div style="background-color: #faf6ef; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c8a96b;">
          <h3 style="color: #08281f; margin-top: 0;">Application Summary:</h3>
          <p><strong>Organization Name:</strong> ${ngoData.organizationName}</p>
          <p><strong>Primary Category:</strong> ${ngoData.category}</p>
          <p><strong>Registered Email:</strong> ${ngoData.email}</p>
          <p><strong>Phone:</strong> ${ngoData.phoneNumber}</p>
          <p><strong>Status:</strong> Under Review (Pending curation)</p>
        </div>
        <p>Our curation team is currently reviewing your details. We evaluate all applications to ensure they align with the Native91 marketplace values and quality standards. We will get in touch with you within 3-5 business days regarding the next steps.</p>
        <p>Thank you for partnering with us to turn everyday commerce into meaningful impact.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #718096; font-size: 12px; text-align: center;">© 2026 Native91 Social Impact Initiative. All rights reserved.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

const sendNgoAdminNotification = async (ngoData) => {
  const mailOptions = {
    from: `"Native91 Social Impact" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
    to: process.env.ADMIN_EMAIL || "orders@native91.com",
    subject: "New NGO Partnership Application - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #08281f;">New NGO Registration Request</h2>
        <p>A new NGO / purpose-led organization has applied for the Social Impact Initiative. Please review their details.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #2d3748;">NGO Details:</h3>
          <p><strong>Name:</strong> ${ngoData.fullName}</p>
          <p><strong>Organization:</strong> ${ngoData.organizationName}</p>
          <p><strong>Email:</strong> ${ngoData.email}</p>
          <p><strong>Phone:</strong> ${ngoData.phoneNumber}</p>
          <p><strong>Category:</strong> ${ngoData.category}</p>
          <p><strong>Cause/Mission:</strong> ${ngoData.causeDescription}</p>
        </div>
        <p>Please log in to the administrator portal to review and update the status of this request.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// POST: Register NGO
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, organizationName, category, causeDescription } = req.body;

    if (!fullName || !email || !phoneNumber || !organizationName || !category || !causeDescription) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingNgo = await Ngo.findOne({ email });
    if (existingNgo) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const ngo = new Ngo({
      fullName,
      email,
      phoneNumber,
      organizationName,
      category,
      causeDescription,
    });

    await ngo.save();

    // Trigger emails asynchronously
    sendNgoConfirmationEmail(ngo).catch(err => {
      console.error("Error sending NGO confirmation email:", err);
    });

    sendNgoAdminNotification(ngo).catch(err => {
      console.error("Error sending NGO admin notification:", err);
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Please check your email.",
      data: {
        id: ngo._id,
        fullName: ngo.fullName,
        email: ngo.email,
        organizationName: ngo.organizationName,
        status: ngo.status,
      },
    });
  } catch (error) {
    console.error("NGO registration error:", error);
    res.status(500).json({
      success: false,
      message: error.code === 11000 
        ? "This email is already registered" 
        : "Failed to submit application. Please try again.",
    });
  }
});

// GET: All NGOs
router.get("/all", async (req, res) => {
  try {
    const ngos = await Ngo.find().sort({ appliedAt: -1 });
    res.json({
      success: true,
      data: ngos,
    });
  } catch (error) {
    console.error("Error fetching NGOs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch NGO data",
    });
  }
});

// PUT: Update NGO status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const ngo = await Ngo.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO application not found",
      });
    }

    const statusMailOptions = {
      from: `"Native91 Social Impact" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
      to: ngo.email,
      subject: `Your Native91 Social Impact Application Update - ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h2 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'}">
            Application Status Update: ${status.toUpperCase()}
          </h2>
          <p>Dear ${ngo.fullName},</p>
          ${status === 'approved' ? `
            <p>We are delighted to inform you that your application for the <strong>Native91 Social Impact Initiative</strong> has been <strong>approved</strong>! 🎉</p>
            <p>Our partnership coordinator will contact you shortly to guide you through listing your products and sharing your organization's unique story on our platform.</p>
          ` : status === 'rejected' ? `
            <p>Thank you for applying to the Native91 Social Impact Initiative.</p>
            <p>We regret to inform you that we are unable to approve your application at this time as it does not align with our current category requirements. We appreciate the wonderful work you do and wish you success with your mission.</p>
          ` : `
            <p>Your application status has been updated to ${status}. Our team is reviewing the details.</p>
          `}
          <p>Best regards,<br/><strong>Native91 Curation Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(statusMailOptions).catch(err => {
      console.error("Error sending NGO status update email:", err);
    });

    res.json({
      success: true,
      message: `NGO application status updated to ${status}`,
      data: ngo,
    });
  } catch (error) {
    console.error("Error updating NGO status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update NGO application status",
    });
  }
});

module.exports = router;
