// utils/otpService.js - Updated to work with both ObjectId and string identifiers

const Seller = require('../Models/Seller');
const nodemailer = require('nodemailer');

// ============================================================
// TEMPORARY OTP STORE (Use Redis in production)
// ============================================================
const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) { // 10 minutes expiry
      otpStore.delete(key);
      console.log(`🧹 Cleaned up expired OTP for: ${key}`);
    }
  }
}, 5 * 60 * 1000);

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
const sendOTPviaEmail = async (email, fullName, otp, isResend = false) => {
  try {
    const subject = isResend 
      ? "🔄 New OTP for Native91 Seller Registration" 
      : "🔐 Your Native91 Verification Code";
    
    const mailOptions = {
      from: `"Native91" <${process.env.EMAIL_USER || "brands@native91.com"}>`,
      to: email,
      subject: subject,
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
                  ${isResend 
                    ? 'You requested a new verification code for your Native91 seller account.' 
                    : 'Thank you for registering with <strong>Native91</strong>. Please use the verification code below to verify your email address.'
                  }
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
// SEND OTP (Works with both MongoDB ObjectId and tempId strings)
// ============================================================
const sendOTP = async (identifier, email, fullName) => {
  try {
    // Check if identifier is a valid MongoDB ObjectId (24 hex chars)
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    
    let sellerEmail = email;
    let sellerName = fullName || 'there';
    
    // If it's a MongoDB ObjectId, try to fetch seller from database
    if (isObjectId) {
      try {
        const seller = await Seller.findById(identifier).select('+otpCode +otpExpires +otpAttempts +otpLastRequested');
        
        if (!seller) {
          return { success: false, message: 'Seller not found' };
        }

        // Check if already verified
        if (seller.phoneVerified) {
          return { success: false, message: 'Email address is already verified' };
        }

        // Rate limiting (prevent spam) for existing sellers
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

        sellerEmail = seller.email;
        sellerName = seller.fullName || 'there';
        
        // Generate OTP using seller's method
        const otp = seller.generateOTP();
        await seller.save();
        
        // Send OTP via email
        const emailResult = await sendOTPviaEmail(sellerEmail, sellerName, otp);
        
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
        
      } catch (dbError) {
        console.error("❌ Database error while fetching seller:", dbError);
        return { success: false, message: 'Failed to fetch seller data' };
      }
    }
    
    // ============================================================
    // Handle tempId (string-based identifier for new registrations)
    // ============================================================
    
    // Check if there's an existing OTP for this tempId
    const existingOTP = otpStore.get(identifier);
    
    // Rate limiting for temp registrations (30 seconds cooldown)
    if (existingOTP) {
      const timeSinceLastRequest = Date.now() - existingOTP.createdAt;
      const cooldownPeriod = 30000; // 30 seconds
      if (timeSinceLastRequest < cooldownPeriod) {
        const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastRequest) / 1000);
        return { 
          success: false, 
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP` 
        };
      }
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with tempId
    otpStore.set(identifier, {
      otp: otp,
      createdAt: Date.now(),
      attempts: 0,
      email: sellerEmail,
      fullName: sellerName,
    });
    
    console.log(`📱 OTP generated for tempId ${identifier}: ${otp}`);
    
    // Send OTP via email
    const emailResult = await sendOTPviaEmail(sellerEmail, sellerName, otp);
    
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
// VERIFY OTP (Works with both MongoDB ObjectId and tempId strings)
// ============================================================
const verifyOTP = async (identifier, enteredOTP) => {
  try {
    // Check if identifier is a valid MongoDB ObjectId (24 hex chars)
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    
    // If it's a MongoDB ObjectId, verify using database
    if (isObjectId) {
      try {
        const seller = await Seller.findById(identifier).select('+otpCode +otpExpires +otpAttempts +phoneVerified');
        
        if (!seller) {
          return { success: false, message: 'Seller not found' };
        }

        if (seller.phoneVerified) {
          return { success: false, message: 'Email address is already verified' };
        }

        const verificationResult = seller.verifyOTP(enteredOTP);
        
        if (!verificationResult.valid) {
          await seller.save();
          return { success: false, message: verificationResult.message };
        }

        await seller.save();

        return {
          success: true,
          message: 'Email address verified successfully!',
          data: {
            phoneVerified: seller.phoneVerified,
            email: seller.email,
          },
        };
        
      } catch (dbError) {
        console.error("❌ Database error while verifying seller:", dbError);
        return { success: false, message: 'Failed to verify seller data' };
      }
    }
    
    // ============================================================
    // Handle tempId (string-based identifier for new registrations)
    // ============================================================
    
    // Get OTP data from store
    const otpData = otpStore.get(identifier);
    
    if (!otpData) {
      return { 
        success: false, 
        message: 'OTP not found or expired. Please request a new OTP.' 
      };
    }
    
    // Check if OTP is expired (10 minutes)
    if (Date.now() - otpData.createdAt > 10 * 60 * 1000) {
      otpStore.delete(identifier);
      return { 
        success: false, 
        message: 'OTP has expired. Please request a new OTP.' 
      };
    }
    
    // Check attempts (max 5 attempts)
    if (otpData.attempts >= 5) {
      otpStore.delete(identifier);
      return { 
        success: false, 
        message: 'Too many failed attempts. Please request a new OTP.' 
      };
    }
    
    // Verify OTP
    if (otpData.otp !== enteredOTP) {
      otpData.attempts += 1;
      otpStore.set(identifier, otpData);
      return { 
        success: false, 
        message: `Invalid OTP. ${5 - otpData.attempts} attempts remaining.` 
      };
    }
    
    // OTP is valid - delete from store
    otpStore.delete(identifier);
    
    return { 
      success: true, 
      message: 'OTP verified successfully!',
      data: {
        phoneVerified: true,
        email: otpData.email,
        fullName: otpData.fullName,
      }
    };
    
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    return { success: false, message: error.message || 'Failed to verify OTP' };
  }
};

// ============================================================
// RESEND OTP (Works with both MongoDB ObjectId and tempId strings)
// ============================================================
const resendOTP = async (identifier, email, fullName) => {
  try {
    // Check if identifier is a valid MongoDB ObjectId (24 hex chars)
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    
    // If it's a MongoDB ObjectId, use the existing sendOTP logic
    if (isObjectId) {
      return await sendOTP(identifier);
    }
    
    // ============================================================
    // Handle tempId (string-based identifier for new registrations)
    // ============================================================
    
    // Check if there's an existing OTP for this tempId
    const existingOTP = otpStore.get(identifier);
    
    // If OTP exists and was created less than 30 seconds ago, prevent resend spam
    if (existingOTP && Date.now() - existingOTP.createdAt < 30000) {
      return { 
        success: false, 
        message: 'Please wait 30 seconds before requesting a new OTP.' 
      };
    }
    
    // Get email from parameter or from existing OTP data
    const userEmail = email || existingOTP?.email;
    const userName = fullName || existingOTP?.fullName || 'there';
    
    if (!userEmail) {
      return { 
        success: false, 
        message: 'Email is required for resending OTP.' 
      };
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store new OTP
    otpStore.set(identifier, {
      otp: otp,
      createdAt: Date.now(),
      attempts: 0,
      email: userEmail,
      fullName: userName,
    });
    
    console.log(`📱 New OTP generated for tempId ${identifier}: ${otp}`);
    
    // Send new OTP via email
    const emailResult = await sendOTPviaEmail(userEmail, userName, otp, true);
    
    if (!emailResult.success) {
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
      message: 'OTP resent successfully to your email',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
    
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    return { success: false, message: error.message || 'Failed to resend OTP' };
  }
};

// ============================================================
// GET OTP STATUS (for debugging)
// ============================================================
const getOTPStatus = (identifier) => {
  const otpData = otpStore.get(identifier);
  if (!otpData) {
    return null;
  }
  
  return {
    exists: true,
    createdAt: otpData.createdAt,
    expiresIn: Math.max(0, 10 * 60 * 1000 - (Date.now() - otpData.createdAt)),
    attempts: otpData.attempts,
    email: otpData.email,
  };
};

// ============================================================
// CLEAR OTP (manual cleanup)
// ============================================================
const clearOTP = (identifier) => {
  otpStore.delete(identifier);
  return { success: true, message: 'OTP cleared successfully' };
};

// ============================================================
// EXPORT ALL FUNCTIONS
// ============================================================
module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  sendOTPviaEmail,
  getOTPStatus,
  clearOTP,
};