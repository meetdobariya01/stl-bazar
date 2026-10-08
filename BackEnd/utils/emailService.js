// utils/emailService.js
const nodemailer = require("nodemailer");
const logger = require("./logger");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.EMAIL_PORT || "465", 10);
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.error("❌ Career mailer: EMAIL_USER or EMAIL_PASS missing in .env");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    family: 4,
  });

  transporter.verify((err) => {
    if (err) {
      logger.error("❌ Career mailer verify failed:", err.message);
    } else {
      logger.info(
        `✅ Career mailer ready — ${user} via ${host}:${port} (secure=${secure})`
      );
    }
  });

  return transporter;
};

/* =========================================================
   HELPERS
========================================================= */

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const FROM_EMAIL =
  process.env.EMAIL_FROM || process.env.EMAIL_USER || "orders@native91.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Native91 Careers";
const FROM = `"${FROM_NAME}" <${FROM_EMAIL}>`;

const HR_EMAIL =
  process.env.HR_EMAIL ||
  process.env.ADMIN_ONBOARDING_EMAIL ||
  "brands@native91.com";

/* =========================================================
   SHARED EMAIL LAYOUT WRAPPER
   (both admin + applicant use this — consistent branding)
========================================================= */

const renderEmailLayout = ({ preview, bodyContent }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Native91 Careers</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <span style="display:none;font-size:1px;color:#f4f4f4;">${escapeHtml(
    preview || ""
  )}</span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">

          <!-- HEADER -->
          <tr>
            <td style="background:#1a1a1a;padding:22px 28px;">
              <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1px;">
                NATIVE91
              </div>
              <div style="color:#c9a54a;font-size:12px;letter-spacing:2px;margin-top:4px;">
                CAREERS
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#fafafa;padding:18px 28px;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#888888;line-height:1.5;">
                This email was sent by Native91 Careers.<br/>
                For any questions, contact us at
                <a href="mailto:${escapeHtml(
                  HR_EMAIL
                )}" style="color:#c9a54a;text-decoration:none;">${escapeHtml(
  HR_EMAIL
)}</a>.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

/* =========================================================
   SHARED STYLES
========================================================= */

const styles = {
  h1: "margin:0 0 12px;font-size:22px;color:#1a1a1a;font-weight:700;",
  p: "margin:0 0 14px;font-size:14px;color:#333333;line-height:1.6;",
  label:
    "font-size:11px;letter-spacing:1px;color:#888888;text-transform:uppercase;padding:10px 12px 10px 0;vertical-align:top;width:150px;border-bottom:1px solid #eeeeee;",
  value:
    "font-size:14px;color:#1a1a1a;padding:10px 0;border-bottom:1px solid #eeeeee;word-break:break-word;",
  btn: "display:inline-block;padding:11px 22px;background:#1a1a1a;color:#ffffff;font-size:12px;letter-spacing:1.5px;text-decoration:none;border-radius:4px;font-weight:600;",
};

/* =========================================================
   HR / ADMIN NOTIFICATION
========================================================= */

const sendApplicationToHR = async (application) => {
  const bodyContent = `
    <h1 style="${styles.h1}">New Job Application</h1>
    <p style="${styles.p}">
      A new application has been submitted on Native91 Careers.
      Full details below.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 4px;">
      <tr>
        <td style="${styles.label}">Name</td>
        <td style="${styles.value}">${escapeHtml(application.fullName)}</td>
      </tr>
      <tr>
        <td style="${styles.label}">Email</td>
        <td style="${styles.value}">
          <a href="mailto:${escapeHtml(
            application.email
          )}" style="color:#c9a54a;text-decoration:none;">
            ${escapeHtml(application.email)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Phone</td>
        <td style="${styles.value}">
          <a href="tel:${escapeHtml(
            application.phone
          )}" style="color:#1a1a1a;text-decoration:none;">
            ${escapeHtml(application.phone)}
          </a>
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Applying For</td>
        <td style="${styles.value}">
          <strong>${escapeHtml(application.applyingFor)}</strong>
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Social Profile</td>
        <td style="${styles.value}">
          ${
            application.socialProfile
              ? `<a href="${escapeHtml(
                  application.socialProfile
                )}" style="color:#c9a54a;text-decoration:none;" target="_blank">${escapeHtml(
                  application.socialProfile
                )}</a>`
              : "—"
          }
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Message</td>
        <td style="${styles.value}">
          ${application.message ? escapeHtml(application.message) : "—"}
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Resume</td>
        <td style="${styles.value}">
          📎 ${escapeHtml(application.resume.originalName)}
          <span style="color:#888888;font-size:12px;">
            (${(application.resume.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Submitted</td>
        <td style="${styles.value}">
          ${new Date(application.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </td>
      </tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:#888888;line-height:1.6;">
      The applicant's resume is attached to this email.
    </p>
  `;

  const html = renderEmailLayout({
    preview: `New application from ${application.fullName} for ${application.applyingFor}`,
    bodyContent,
  });

  try {
    await getTransporter().sendMail({
      from: FROM,
      to: HR_EMAIL,
      replyTo: application.email,
      subject: `New Application: ${application.applyingFor} – ${application.fullName}`,
      html,
      attachments: [
        {
          filename: application.resume.originalName,
          path: application.resume.path,
        },
      ],
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
  const bodyContent = `
    <h1 style="${styles.h1}">Thanks for applying, ${escapeHtml(
      application.fullName.split(" ")[0]
    )}!</h1>

    <p style="${styles.p}">
      We've received your application for the
      <strong>${escapeHtml(application.applyingFor)}</strong> role at Native91.
    </p>

    <p style="${styles.p}">
      Our team will review your profile and get back to you soon.
      If your experience matches what we're looking for, we'll reach out
      to schedule the next step.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 4px;">
      <tr>
        <td style="${styles.label}">Position</td>
        <td style="${styles.value}">
          <strong>${escapeHtml(application.applyingFor)}</strong>
        </td>
      </tr>
      <tr>
        <td style="${styles.label}">Location</td>
        <td style="${styles.value}">Remote</td>
      </tr>
      <tr>
        <td style="${styles.label}">Submitted</td>
        <td style="${styles.value}">
          ${new Date(application.createdAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </td>
      </tr>
    </table>

    <p style="${styles.p} margin-top:20px;">
      While you wait, feel free to explore what we're building at
      <a href="https://native91.com" style="color:#c9a54a;text-decoration:none;">native91.com</a>.
    </p>

    <p style="${styles.p} margin-top:22px;">
      Warm regards,<br/>
      <strong>Team Native91</strong>
    </p>
  `;

  const html = renderEmailLayout({
    preview: `We received your application for ${application.applyingFor}`,
    bodyContent,
  });

  try {
    await getTransporter().sendMail({
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