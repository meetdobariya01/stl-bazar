// Router/TouchwithUs.js - UPDATED WITH HOSTINGER
const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

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

router.post("/TouchwithUs", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      message,
    } = req.body;

    const mailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
      to: process.env.ADMIN_SUPPORT_EMAIL || "support@native91.com",
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form</h2>
        <p><b>First Name:</b> ${firstName}</p>
        <p><b>Last Name:</b> ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to send mail",
    });
  }
});

module.exports = router;