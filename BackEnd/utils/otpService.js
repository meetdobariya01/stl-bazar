// utils/otpService.js

const Seller = require('../Models/Seller');
const nodemailer = require('nodemailer');

// ============================================================
// EMAIL CONFIGURATION
// ============================================================
const emailTransporter = nodemailer.createTransport({
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

emailTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email configuration error:", error);
  } else {
    console.log("✅ Email server is ready to send OTP");
  }
});

// ============================================================
// SEND OTP VIA EMAIL
// ============================================================
const sendOTPviaEmail = async (email, fullName, otp) => {
  try {
    const mailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
      to: email,
      subject: "🔐 Your Native91 Verification Code",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f5f5f2;
              font-family: Arial, Helvetica, sans-serif;
              color: #30342f;
            }
            .email-wrapper {
              width: 100%;
              padding: 30px 15px;
              background-color: #f5f5f2;
            }
            .email-container {
              width: 100%;
              max-width: 520px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .header {
              background-color: #073f31;
              padding: 30px 25px;
              text-align: center;
            }
            .brand-name {
              color: #e5d6a5;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 24px;
              letter-spacing: 4px;
              margin: 0;
              font-weight: normal;
            }
            .brand-subtitle {
              color: rgba(255,255,255,0.7);
              font-size: 10px;
              letter-spacing: 1.5px;
              margin-top: 4px;
              text-transform: uppercase;
            }
            .content {
              padding: 35px 30px 30px;
            }
            .greeting {
              font-size: 16px;
              color: #333631;
              margin: 0 0 8px;
              font-weight: 600;
            }
            .paragraph {
              font-size: 14px;
              line-height: 1.6;
              color: #50534e;
              margin: 0 0 12px;
            }
            .otp-box {
              background-color: #faf9f5;
              border: 1px solid #eeeae0;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .otp-code {
              font-size: 38px;
              font-weight: bold;
              color: #073f31;
              letter-spacing: 8px;
              font-family: monospace;
              padding: 10px 0;
            }
            .otp-label {
              font-size: 11px;
              color: #74766f;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .timer-note {
              font-size: 12px;
              color: #74766f;
              text-align: center;
              margin: 10px 0 0;
            }
            .divider {
              border: none;
              border-top: 1px solid #eeeae0;
              margin: 25px 0;
            }
            .footer {
              text-align: center;
              padding: 20px 30px;
              font-size: 11px;
              color: #999b94;
              border-top: 1px solid #eeeae0;
            }
            .security-note {
              display: inline-block;
              background: #f8f7f3;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 11px;
              color: #74766f;
            }
            @media only screen and (max-width: 600px) {
              .email-wrapper { padding: 10px 8px; }
              .content { padding: 25px 18px 20px; }
              .otp-code { font-size: 32px; letter-spacing: 6px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <!-- HEADER -->
              <div class="header">
                <div class="brand-name">NATIVE91</div>
                <div class="brand-subtitle">RESERVED FOR THE REMARKABLE</div>
              </div>
              
              <!-- CONTENT -->
              <div class="content">
                <p class="greeting">Hello ${fullName || 'there'},</p>
                
                <p class="paragraph">
                  Thank you for registering with <strong>Native91</strong>. 
                  Please use the verification code below to verify your phone number.
                </p>
                
                <!-- OTP CODE -->
                <div class="otp-box">
                  <div class="otp-label">Your Verification Code</div>
                  <div class="otp-code">${otp}</div>
                  <div class="timer-note">⏱ This code expires in 10 minutes</div>
                </div>
                
                <p class="paragraph" style="font-size: 13px; color: #74766f;">
                  If you didn't request this code, please ignore this email.
                </p>
                
                <hr class="divider">
                
                <div style="text-align: center;">
                  <span class="security-note">🔒 This is an automated security notification</span>
                </div>
              </div>
              
              <!-- FOOTER -->
              <div class="footer">
                <p style="margin: 0 0 4px;">
                  &copy; ${new Date().getFullYear()} Native91. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 10px; color: #b0b2aa;">
                  This is an automated message. Please do not reply.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email}, MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error("❌ OTP email error:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// SEND OTP TO SELLER
// ============================================================
const sendOTP = async (sellerId) => {
  try {
    const seller = await Seller.findById(sellerId).select('+otpCode +otpExpires +otpAttempts +otpLastRequested');
    
    if (!seller) {
      return { success: false, message: 'Seller not found' };
    }

    // Check if already verified
    if (seller.phoneVerified) {
      return { success: false, message: 'Phone number is already verified' };
    }

    // Rate limiting (prevent spam)
    if (seller.otpLastRequested) {
      const timeSinceLastRequest = Date.now() - seller.otpLastRequested.getTime();
      const cooldownPeriod = 60000; // 60 seconds
      if (timeSinceLastRequest < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastRequest) / 1000);
        return { 
          success: false, 
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP` 
        };
      }
    }

    // Generate OTP
    const otp = seller.generateOTP();
    await seller.save();

    // Send OTP via EMAIL
    const emailResult = await sendOTPviaEmail(seller.email, seller.fullName, otp);

    if (!emailResult.success) {
      // In development, still return OTP for testing
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'OTP generated (development mode - check console)',
          otp,
          emailResult,
        };
      }
      return {
        success: false,
        message: 'Failed to send OTP email. Please try again.',
        emailResult,
      };
    }

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };

  } catch (error) {
    console.error("❌ Send OTP error:", error);
    return { success: false, message: error.message || 'Failed to send OTP' };
  }
};

// ============================================================
// VERIFY OTP
// ============================================================
const verifyOTP = async (sellerId, enteredOTP) => {
  try {
    const seller = await Seller.findById(sellerId).select('+otpCode +otpExpires +otpAttempts +phoneVerified');
    
    if (!seller) {
      return { success: false, message: 'Seller not found' };
    }

    if (seller.phoneVerified) {
      return { success: false, message: 'Phone number is already verified' };
    }

    const verificationResult = seller.verifyOTP(enteredOTP);
    
    if (!verificationResult.valid) {
      await seller.save();
      return { success: false, message: verificationResult.message };
    }

    await seller.save();

    return {
      success: true,
      message: 'Phone number verified successfully!',
      data: {
        phoneVerified: seller.phoneVerified,
      },
    };

  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return { success: false, message: error.message || 'Failed to verify OTP' };
  }
};

// ============================================================
// RESEND OTP
// ============================================================
const resendOTP = async (sellerId) => {
  return await sendOTP(sellerId);
};

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  sendOTPviaEmail,
};