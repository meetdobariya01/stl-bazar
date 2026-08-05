// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testHostinger() {
  console.log("🔍 Testing Hostinger Email...");
  
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Connection successful!");
    
    // CHANGE THIS TO YOUR EMAIL
    const info = await transporter.sendMail({
      from: `"Native91" <${process.env.EMAIL_USER}>`,
      to: "YOUR_EMAIL_HERE@gmail.com", // ← PUT YOUR EMAIL
      subject: "✅ Hostinger Email Test",
      html: `
        <h1>✅ Test Successful!</h1>
        <p>Your Hostinger email is working!</p>
        <p>From: ${process.env.EMAIL_USER}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });
    
    console.log("✅ Email sent!");
    console.log(`   Message ID: ${info.messageId}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testHostinger();