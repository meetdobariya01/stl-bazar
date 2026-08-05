// Router/seller.js - UPDATED WITH HOSTINGER
const express = require("express");
const router = express.Router();
const Seller = require("../Models/Seller");
const nodemailer = require("nodemailer");

// ✅ USE HOSTINGER SMTP (NOT GMAIL)
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

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Send email function
const sendSellerConfirmationEmail = async (sellerData) => {
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
    to: sellerData.email,
    subject: "Welcome to Native91 Seller Program!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Welcome ${sellerData.fullName}! 🎉</h2>
        <p>Thank you for registering as a seller on <strong>Native91</strong>.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-bottom: 15px;">Registration Details:</h3>
          <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Phone:</strong> ${sellerData.phoneNumber}</p>
          <p><strong>Category:</strong> ${sellerData.category}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        <p>Our team will review your application within 24-48 hours.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #718096; font-size: 12px;">© 2024 Native91. All rights reserved.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Send admin notification email
const sendAdminNotification = async (sellerData) => {
  const mailOptions = {
    from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
    to: process.env.ADMIN_EMAIL || "orders@native91.com",
    subject: "New Seller Registration - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">New Seller Registration</h2>
        <p>A new seller has registered on Native91. Please review their application.</p>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Seller Details:</h3>
          <p><strong>Name:</strong> ${sellerData.fullName}</p>
          <p><strong>Business:</strong> ${sellerData.businessName}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Phone:</strong> ${sellerData.phoneNumber}</p>
          <p><strong>Category:</strong> ${sellerData.category}</p>
        </div>
        <p>Please log in to the admin panel to approve or reject this application.</p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Register seller
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

    const seller = new Seller({
      fullName,
      email,
      phoneNumber,
      businessName,
      category,
    });

    await seller.save();

    sendSellerConfirmationEmail(seller).catch(err => {
      console.error("Error sending seller email:", err);
    });

    sendAdminNotification(seller).catch(err => {
      console.error("Error sending admin email:", err);
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email.",
      data: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        businessName: seller.businessName,
        status: seller.status,
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

// Get all sellers
router.get("/all", async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ registeredAt: -1 });
    res.json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sellers",
    });
  }
});

// Update seller status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const statusMailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
      to: seller.email,
      subject: `Your Native91 Seller Application - ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'}">
            Application ${status === 'approved' ? 'Approved! 🎉' : 'Status Update'}
          </h2>
          ${status === 'approved' ? `
            <p>Congratulations ${seller.fullName}!</p>
            <p>Your seller application has been approved.</p>
          ` : status === 'rejected' ? `
            <p>Dear ${seller.fullName},</p>
            <p>We regret to inform you that your seller application has not been approved.</p>
          ` : `
            <p>Dear ${seller.fullName},</p>
            <p>Your application is currently under review.</p>
          `}
          <p>Thank you for choosing Native91.</p>
        </div>
      `,
    };

    await transporter.sendMail(statusMailOptions);

    res.json({
      success: true,
      message: `Seller application ${status}`,
      data: seller,
    });
  } catch (error) {
    console.error("Error updating seller status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update seller status",
    });
  }
});

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Seller routes are working!" });
});

module.exports = router;