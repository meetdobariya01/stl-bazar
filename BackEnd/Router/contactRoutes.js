// Router/send-mail.js - UPDATED WITH HOSTINGER SMTP
const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

// ============================================================
// HOSTINGER SMTP TRANSPORTER (REPLACES GMAIL)
// ============================================================
const createTransporter = () => {
  return nodemailer.createTransport({
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
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

// ============================================================
// SEND MAIL ENDPOINT
// ============================================================
router.post("/send-mail", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
      to: process.env.ADMIN_SUPPORT_EMAIL || "support@native91.com",
      replyTo: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4a5568; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f7fafc; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #4a5568; }
            .value { color: #2d3748; }
            .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #4a5568; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📧 New Contact Message</h2>
            </div>
            <div class="content">
              <div class="field"><span class="label">Name:</span> <span class="value">${name}</span></div>
              <div class="field"><span class="label">Email:</span> <span class="value">${email}</span></div>
              <div class="field"><span class="label">Subject:</span> <span class="value">${subject}</span></div>
              <div class="field"><span class="label">Message:</span></div>
              <div class="message-box">${message}</div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Send mail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

// ============================================================
// TOUCH WITH US ENDPOINT
// ============================================================
router.post("/TouchwithUs", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, company, message } = req.body;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "orders@native91.com"}>`,
      to: process.env.ADMIN_SUPPORT_EMAIL || "support@native91.com",
      replyTo: email,
      subject: "New Contact Form Submission",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2b6cb0; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background: #f7fafc; border-radius: 0 0 5px 5px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #2b6cb0; }
            .value { color: #2d3748; }
            .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2b6cb0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field"><span class="label">First Name:</span> <span class="value">${firstName}</span></div>
              <div class="field"><span class="label">Last Name:</span> <span class="value">${lastName}</span></div>
              <div class="field"><span class="label">Email:</span> <span class="value">${email}</span></div>
              <div class="field"><span class="label">Phone:</span> <span class="value">${phone}</span></div>
              <div class="field"><span class="label">Company:</span> <span class="value">${company}</span></div>
              <div class="field"><span class="label">Message:</span></div>
              <div class="message-box">${message}</div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.error("Touch with us error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send mail",
    });
  }
});

module.exports = router;