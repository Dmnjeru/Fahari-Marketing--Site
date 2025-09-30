// backend/utils/mailer.js
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
export async function initMailer() {
  if (transporter && smtpConfigured) return transporter;

  const missingVars = [];
  if (!SMTP_HOST) missingVars.push("SMTP_HOST");
  if (!SMTP_PORT) missingVars.push("SMTP_PORT");
  if (!SMTP_USER) missingVars.push("SMTP_USER");
  if (!SMTP_PASS) missingVars.push("SMTP_PASS");

  if (missingVars.length > 0) {
    const msg = `⚠️ Missing SMTP vars: ${missingVars.join(", ")}. Emails ${
      isDev ? "will be logged (DEV mode)" : "cannot be sent (production)"
    }`;
    if (isProd) {
      logger.error(msg);
      throw new Error(msg);
    } else {
      logger.warn(msg);
      smtpConfigured = false;
      return null;
    }
  }

  const secure = SMTP_SECURE === "true" || Number(SMTP_PORT) === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: isProd },
    debug: isDev,
    connectionTimeout: 30000,
  });

  try {
    await transporter.verify();
    smtpConfigured = true;
    logger.info(`✅ SMTP verified: host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${secure}`);
  } catch (err) {
    logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
    smtpConfigured = false;
    if (isProd) throw new Error("SMTP verification failed in production: " + err?.message);
  }

  return transporter;
}

// ----------------- Send Email -----------------
/**
 * Send email safely in dev/prod.
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} [options.text] - plain text
 * @param {string} [options.html] - HTML content
 * @param {string} [options.from] - optional from override
 */
export async function sendEmail({ to, subject, text, html, from }) {
  if (!to || !subject) throw new Error("sendEmail: 'to' and 'subject' are required");

  if (!transporter || !smtpConfigured) {
    await initMailer();
  }

  if (!smtpConfigured || !transporter) {
    logger.info(`📧 [LOG ONLY] Email skipped: to=${to}, subject=${subject}`);
    logger.debug("Email content:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to,
    subject,
    text: text ?? "",
    html: html ?? "",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `📧 Email sent: to=${to}, subject=${subject}, messageId=${info.messageId}`
    );
    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("Preview URL:", preview);
      logger.debug("SMTP send info:", info);
    }
    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email to ${to}: ${err?.message || err}`);
    throw err;
  }
}

// ----------------- Default Export -----------------
export default { initMailer, sendEmail };
