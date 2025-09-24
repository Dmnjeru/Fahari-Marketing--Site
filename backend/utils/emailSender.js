// backend/utils/emailSender.js
import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from "dotenv";

dotenv.config();

// ----------------- Env & Mode -----------------
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  FROM_EMAIL,
  NODE_ENV,
} = process.env;

const isProd = NODE_ENV === "production";
const isDev = !isProd;

// ----------------- Internal State -----------------
let transporter = null;
let smtpConfigured = false;

// ----------------- Initialize Transporter -----------------
export async function initEmail() {
  if (transporter && smtpConfigured) return smtpConfigured;

  // Check missing critical vars
  const missingVars = [];
  if (!SMTP_HOST) missingVars.push("SMTP_HOST");
  if (!SMTP_PORT) missingVars.push("SMTP_PORT");
  if (!SMTP_USER) missingVars.push("SMTP_USER");
  if (!SMTP_PASS) missingVars.push("SMTP_PASS");

  if (missingVars.length > 0) {
    const msg = `⚠️ Missing SMTP variables: ${missingVars.join(", ")}. Emails ${
      isDev ? "will be logged (DEV mode)" : "cannot be sent (production)"
    }`;
    if (isProd) {
      logger.error(msg);
      throw new Error(msg);
    } else {
      logger.warn(msg);
      smtpConfigured = false;
      return smtpConfigured;
    }
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465, // SSL for 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: isProd,
      },
      debug: isDev,
      connectionTimeout: 30000,
    });

    await transporter.verify();
    smtpConfigured = true;
    logger.info(
      `✅ SMTP verified and ready: host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${transporter.options.secure}`
    );
  } catch (err) {
    logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
    smtpConfigured = false;
    if (isProd) throw new Error("SMTP verification failed in production: " + err?.message);
  }

  return smtpConfigured;
}

// ----------------- Default Recipients -----------------
const defaultRecipients = {
  careers: "careers@faharidairies.co.ke",
  contact: "info@faharidairies.co.ke",
  orders: "orders@faharidairies.co.ke",
  default: "info@faharidairies.co.ke",
};

// ----------------- Send Email -----------------
/**
 * Send email safely in dev/prod.
 * @param {Object} options
 * @param {string} options.to - Recipient email OR page key ('careers', 'contact', 'orders')
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @param {string} [options.from] - Optional from address override
 */
export async function sendEmail({ to, subject, text, html, from }) {
  if (!subject || !to) throw new Error("sendEmail: 'to' and 'subject' are required");

  // Lazy init if transporter not ready
  if (!transporter || !smtpConfigured) {
    await initEmail();
  }

  // Resolve recipient email
  const recipient =
    defaultRecipients[to] || (to.includes("@") ? to : defaultRecipients.default);

  // Dev/log-only fallback
  if (!smtpConfigured) {
    logger.info(`📧 [LOG ONLY] Email skipped: to=${recipient}, subject=${subject}`);
    logger.debug("Email content:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Site" <${SMTP_USER}>`,
    to: recipient,
    subject,
    text: text ?? "",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `📧 Email sent successfully: to=${recipient}, subject=${subject}, messageId=${info.messageId}`
    );

    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("Preview URL:", preview);
      logger.debug("SMTP send info:", info);
    }

    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email to ${recipient}: ${err?.message || err}`);
    throw err;
  }
}

// ----------------- Default Export -----------------
export default { initEmail, sendEmail };
