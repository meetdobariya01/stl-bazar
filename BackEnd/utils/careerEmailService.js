// utils/careerEmailService.js
const fs = require("fs");

/* =========================================================
   ⚠️ CHANGE THIS LINE to point at YOUR existing mailer file
========================================================= */

// If your mailer exports `transporter` (Case A or B):
const transporter = require("../utils/emailService"); // <-- ADJUST PATH & SHAPE

// If your mailer exports `{ transporter }` (Case B or D):
// const { transporter } = require("../Utils/emailService");

// If your mailer exports `{ sendEmail }` (Case C):
// const { sendEmail } = require("../Utils/emailService");

const logger = require("./logger");

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const FROM = `"Native91 Careers" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;
const HR_EMAIL = process.env.HR_EMAIL || "brands@native91.com";

/* =========================================================
   HR NOTIFICATION
========================================================= */

const sendApplicationToHR = async (application) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;">
      <h2>New Job Application – Native91</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(application.fullName)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(application.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(application.phone)}</td></tr>
        <tr><td><strong>Applying For</strong></td><td>${escapeHtml(application.applyingFor)}</td></tr>
        <tr><td><strong>Social Profile</strong></td><td>${escapeHtml(application.socialProfile || "—")}</td></tr>
        <tr><td><strong>Message</strong></td><td>${escapeHtml(application.message || "—")}</td></tr>
        <tr><td><strong>Resume</strong></td><td>${escapeHtml(application.resume.originalName)}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: HR_EMAIL,
      subject: `New Application: ${application.applyingFor} – ${application.fullName}`,
      html,
      attachments: fs.existsSync(application.resume.path)
        ? [{ filename: application.resume.originalName, path: application.resume.path }]
        : [],
    });
    logger.info(`✅ HR notified for application from ${application.email}`);
  } catch (error) {
    logger.error("❌ Failed to notify HR:", error.message);
  }
};

/* =========================================================
   APPLICANT ACKNOWLEDGEMENT
========================================================= */

const sendAcknowledgementToApplicant = async (application) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;">
      <p>Hi ${escapeHtml(application.fullName)},</p>
      <p>Thank you for applying to Native91 for the
        <strong>${escapeHtml(application.applyingFor)}</strong> role.</p>
      <p>We've received your application and will get back to you soon.</p>
      <p>Warm regards,<br/>Team Native91</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: application.email,
      subject: "We received your application – Native91",
      html,
    });
    logger.info(`✅ Acknowledgement sent to ${application.email}`);
  } catch (error) {
    logger.error("❌ Failed to send acknowledgement:", error.message);
  }
};

module.exports = {
  sendApplicationToHR,
  sendAcknowledgementToApplicant,
};