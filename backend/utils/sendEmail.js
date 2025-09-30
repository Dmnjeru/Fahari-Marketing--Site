// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load backend/.env if any SMTP env missing
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  try {
    dotenv.config({ path: join(__dirname, "..", ".env") });
    logger.debug && logger.debug("dotenv: loaded backend/.env");
  } catch (err) {
    // ignore; handled below
  }
}

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

const missing = [];
if (!SMTP_HOST) missing.push("SMTP_HOST");
if (!SMTP_PORT) missing.push("SMTP_PORT");
if (!SMTP_USER) missing.push("SMTP_USER");
if (!SMTP_PASS) missing.push("SMTP_PASS");

if (missing.length > 0) {
  const msg = `Missing SMTP credentials: ${missing.join(", ")}.`;
  if (isProd) {
    logger.error(`❌ ${msg} Aborting startup (production requires SMTP).`);
    throw new Error(msg);
  } else {
    logger.warn(`⚠️ ${msg} Running in dev/log-only mode — emails will be logged.`);
  }
}

let transporter = null;

if (missing.length === 0) {
  const portNum = Number(SMTP_PORT || 465);
  const secure = SMTP_SECURE === "true" || portNum === 465;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: portNum,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: isProd },
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    greetingTimeout: 30000,
    socketTimeout: 60000,
    logger: true, // logs SMTP connection info
    debug: isDev, // verbose SMTP debug
  });
}

// Verify transporter before sending any emails
async function verifyTransporter() {
  if (!transporter) return false;
  try {
    await transporter.verify();
    logger.info(`✅ SMTP verified (host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${secure})`);
    return true;
  } catch (err) {
    logger.error(`❌ SMTP verification failed: ${(err && err.message) || err}`);
    if (isProd) throw new Error(`SMTP verification failed in production: ${(err && err.message) || err}`);
    return false;
  }
}

/**
 * Send an email
 * @param {Object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {string} [opts.from]
 * @param {Array} [opts.attachments]
 */
export async function sendEmail({ to, subject, text, html, from, attachments } = {}) {
  if (!to || !subject) throw new Error("sendEmail: 'to' and 'subject' are required");

  // If transporter not configured, log-only mode
  if (!transporter) {
    logger.info("📧 [LOG ONLY] Email would be sent:", {
      to,
      subject,
      from: from ?? FROM_EMAIL ?? SMTP_USER,
      attachmentsCount: attachments?.length ?? 0,
    });
    logger.debug && logger.debug("Email payload:", { text, html, attachments });
    return { logged: true };
  }

  // Verify transporter before sending
  await verifyTransporter();

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(
      `📧 Email sent: ${subject} → ${Array.isArray(to) ? to.join(",") : to} (id=${info.messageId}, attachments=${attachments?.length ?? 0})`
    );

    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("📨 Preview URL:", preview);
      logger.debug && logger.debug("SMTP send info:", info);
    }

    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email: ${(err && err.message) || err}`, { subject, to });
    throw err;
  }
}

export default sendEmail;
