import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from "dotenv";

dotenv.config();

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

let transporter = null;
let smtpReady = false;

// Default recipient keys
const defaultRecipients = {
  careers: "careers@faharidairies.co.ke",
  contact: "info@faharidairies.co.ke",
  orders: "orders@faharidairies.co.ke",
  default: "info@faharidairies.co.ke",
};

/**
 * Initialize transporter and verify connection
 */
export async function initMailer() {
  if (transporter && smtpReady) return transporter;

  const missing = [];
  if (!SMTP_HOST) missing.push("SMTP_HOST");
  if (!SMTP_PORT) missing.push("SMTP_PORT");
  if (!SMTP_USER) missing.push("SMTP_USER");
  if (!SMTP_PASS) missing.push("SMTP_PASS");

  if (missing.length > 0) {
    const msg = `Missing SMTP credentials: ${missing.join(", ")}. Emails ${
      isDev ? "will be logged (DEV mode)" : "cannot be sent (production)"
    }`;
    logger[isProd ? "error" : "warn"](msg);
    if (isProd) throw new Error(msg);
    return null;
  }

  const portNum = Number(SMTP_PORT);
  const secure = SMTP_SECURE === "true" || portNum === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNum,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: isProd }, // adjust for cPanel TLS if needed
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true, // force debug for Render
    logger: true,
  });

  try {
    await transporter.verify();
    smtpReady = true;
    logger.info(`✅ SMTP verified (host=${SMTP_HOST}, port=${portNum}, secure=${secure})`);
  } catch (err) {
    smtpReady = false;
    logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
    if (isProd) throw new Error(`SMTP verification failed in production: ${err?.message || err}`);
    else logger.warn("Continuing in DEV mode; emails will be logged instead of sent.");
  }

  return transporter;
}

/**
 * Send an email
 * @param {Object} options
 * @param {string|string[]} options.to - recipient email or key ('careers', 'contact')
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.from] - optional sender override
 * @param {Array} [options.attachments] - optional Nodemailer attachments
 */
export async function sendEmail({ to, subject, text, html, from, attachments } = {}) {
  if (!to || !subject) throw new Error("sendEmail requires 'to' and 'subject'");

  if (!transporter || !smtpReady) await initMailer();

  const recipient = defaultRecipients[to] || (to.includes("@") ? to : defaultRecipients.default);

  // Dev/log-only fallback
  if (!smtpReady || !transporter) {
    logger.info(`[LOG ONLY] Email skipped: to=${recipient}, subject=${subject}`);
    logger.debug("Email payload:", { text, html, attachments });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to: recipient,
    subject,
    text: text ?? "",
    html: html ?? "",
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent: to=${recipient}, subject=${subject}, id=${info.messageId}`);
    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("Preview URL:", preview);
      logger.debug("SMTP info:", info);
    }
    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email to ${recipient}: ${err?.message || err}`);
    throw err;
  }
}

// Default export
export default { initMailer, sendEmail };
