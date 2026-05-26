const express = require("express");
const router = express.Router();
const Seller = require("../Models/Seller");
const nodemailer = require("nodemailer");

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
    from: `"Brandel" <${process.env.EMAIL_USER}>`,
    to: sellerData.email,
    subject: "Welcome to Brandel Seller Program!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Welcome ${sellerData.fullName}! 🎉</h2>
        
        <p>Thank you for registering as a seller on <strong>Brandel</strong>.</p>
        
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2d3748; margin-bottom: 15px;">Registration Details:</h3>
          <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Phone:</strong> ${sellerData.phoneNumber}</p>
          <p><strong>Category:</strong> ${sellerData.category}</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        
        <p>Our team will review your application within 24-48 hours. You will receive another email once your account is approved.</p>
        
        <div style="background-color: #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Next Steps:</h4>
          <ul>
            <li>Our team will verify your business details</li>
            <li>You'll receive login credentials after approval</li>
            <li>Start listing your products and reach millions of customers</li>
          </ul>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        
        <p style="color: #718096; font-size: 12px;">
          © 2024 Brandel. All rights reserved.<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

// Send admin notification email
const sendAdminNotification = async (sellerData) => {
  const mailOptions = {
    from: `"Brandel" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || "admin@brandel.com",
    subject: "New Seller Registration - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">New Seller Registration</h2>
        
        <p>A new seller has registered on Brandel. Please review their application.</p>
        
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

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !businessName || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please use a different email.",
      });
    }

    // Create new seller
    const seller = new Seller({
      fullName,
      email,
      phoneNumber,
      businessName,
      category,
    });

    await seller.save();

    // Send confirmation email to seller (don't wait for it)
    sendSellerConfirmationEmail(seller).catch(err => {
      console.error("Error sending seller email:", err);
    });

    // Send notification to admin (don't wait for it)
    sendAdminNotification(seller).catch(err => {
      console.error("Error sending admin email:", err);
    });

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email for confirmation.",
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

// Get all sellers (Admin only)
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

// Update seller status (Admin only)
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

    // Send status update email
    const statusMailOptions = {
      from: `"Brandel" <${process.env.EMAIL_USER}>`,
      to: seller.email,
      subject: `Your Brandel Seller Application - ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'}">
            Application ${status === 'approved' ? 'Approved! 🎉' : 'Status Update'}
          </h2>
          
          ${status === 'approved' ? `
            <p>Congratulations ${seller.fullName}!</p>
            <p>Your seller application has been approved. You can now log in to your seller dashboard.</p>
            <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>Next Steps:</h4>
              <ol>
                <li>Log in to your seller account</li>
                <li>Complete your store profile</li>
                <li>Start listing your products</li>
              </ol>
            </div>
          ` : status === 'rejected' ? `
            <p>Dear ${seller.fullName},</p>
            <p>We regret to inform you that your seller application has not been approved at this time.</p>
            <p>Please contact our support team for more information.</p>
          ` : `
            <p>Dear ${seller.fullName},</p>
            <p>Your application is currently under review. We will notify you once a decision has been made.</p>
          `}
          
          <p>Thank you for choosing Brandel.</p>
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