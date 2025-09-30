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

/**
 * Initialize SMTP transporter
 */
export async function initEmail() {
  if (transporter && smtpReady) return smtpReady;

  // Validate env
  const missing = [];
  if (!SMTP_HOST) missing.push("SMTP_HOST");
  if (!SMTP_PORT) missing.push("SMTP_PORT");
  if (!SMTP_USER) missing.push("SMTP_USER");
  if (!SMTP_PASS) missing.push("SMTP_PASS");

  if (missing.length > 0) {
    const msg = `Missing SMTP env vars: ${missing.join(",")}. Emails ${
      isDev ? "will be logged (dev)" : "cannot be sent (prod)"
    }`;
    logger[isProd ? "error" : "warn"](msg);
    if (isProd) throw new Error(msg);
    return false;
  }

  const portNum = Number(SMTP_PORT);
  const secure = SMTP_SECURE === "true" || portNum === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNum,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: isProd }, // adjust if cPanel TLS issues
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: isDev, // enable SMTP debug
    logger: true, // logs protocol info
  });

  try {
    await transporter.verify();
    smtpReady = true;
    logger.info(`✅ SMTP verified (host=${SMTP_HOST}, port=${portNum}, secure=${secure})`);
  } catch (err) {
    smtpReady = false;
    logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
    if (isProd) throw new Error(`SMTP verification failed in production: ${err?.message || err}`);
  }

  return smtpReady;
}

// Default recipients mapping
const defaultRecipients = {
  careers: "careers@faharidairies.co.ke",
  contact: "info@faharidairies.co.ke",
  orders: "orders@faharidairies.co.ke",
  default: "info@faharidairies.co.ke",
};

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Email OR key ('careers', 'contact', etc.)
 * @param {string} options.subject
 * @param {string} [options.text]
 * @param {string} [options.html]
 * @param {string} [options.from]
 * @param {Array} [options.attachments]
 */
export async function sendEmail({ to, subject, text, html, from, attachments } = {}) {
  if (!to || !subject) throw new Error("sendEmail requires 'to' and 'subject'");

  // Ensure transporter ready
  if (!transporter || !smtpReady) {
    await initEmail();
  }

  const recipient = defaultRecipients[to] || (to.includes("@") ? to : defaultRecipients.default);

  // Dev/log-only fallback
  if (!smtpReady) {
    logger.info(`[LOG ONLY] Email skipped: to=${recipient}, subject=${subject}`);
    logger.debug("Email payload:", { text, html, attachments });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to: recipient,
    subject,
    text: text ?? "",
    html,
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

export default { initEmail, sendEmail };
