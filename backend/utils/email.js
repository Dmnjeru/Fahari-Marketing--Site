// backend/utils/email.js
import nodemailer from "nodemailer";
import logger from "../config/logger.js";

// ----------------- Env / Mode -----------------
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  FROM_EMAIL,
  NODE_ENV,
  SMTP_CONNECTION_TIMEOUT_MS,
} = process.env;

const isProd = NODE_ENV === "production";
const isDev = !isProd;

// ----------------- Validate SMTP -----------------
const missing = [];
if (!SMTP_HOST) missing.push("SMTP_HOST");
if (!SMTP_PORT) missing.push("SMTP_PORT");
if (!SMTP_USER) missing.push("SMTP_USER");
if (!SMTP_PASS) missing.push("SMTP_PASS");

if (missing.length > 0) {
  const msg = `❌ Missing SMTP credentials: ${missing.join(
    ", "
  )}. Emails ${isDev ? "will be logged (DEV mode)" : "cannot be sent (production)"}`;
  if (isProd) {
    logger.error(msg);
    throw new Error(msg);
  } else {
    logger.warn(msg);
  }
}

// ----------------- Transporter -----------------
let transporter = null;

if (missing.length === 0) {
  const portNum = Number(SMTP_PORT);
  const secure = SMTP_SECURE === "true" || portNum === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNum,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: isProd, // strict TLS in production
    },
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    debug: isDev,
  });

  // Verify transporter immediately
  (async () => {
    try {
      await transporter.verify();
      logger.info(
        `✅ SMTP verified: host=${SMTP_HOST}, port=${portNum}, secure=${secure}`
      );
    } catch (err) {
      logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
      if (isProd) throw new Error(`SMTP verification failed in production: ${err?.message}`);
      else logger.warn("Continuing in DEV mode; emails will be logged instead of sent.");
    }
  })();
}

// ----------------- Send email -----------------
/**
 * Send an email
 * @param {Object} options
 * @param {string|string[]} options.to - recipient(s)
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.from] - optional sender override
 */
export async function sendEmail({ to, subject, text, html, from }) {
  if (!to || !subject) throw new Error("sendEmail: 'to' and 'subject' are required");

  // Dev/log-only mode
  if (!transporter) {
    logger.info(
      "📧 [LOG ONLY] Email would be sent:",
      { to, subject, from: from ?? FROM_EMAIL ?? SMTP_USER }
    );
    logger.debug("Email payload:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `📧 Email sent: ${subject} → ${Array.isArray(to) ? to.join(",") : to} (id=${info.messageId})`
    );

    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("Preview URL:", preview);
      logger.debug("SMTP send info:", info);
    }

    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email (${subject} → ${to}): ${err?.message || err}`);
    throw err;
  }
}

// ✅ Default export
export default { sendEmail };
