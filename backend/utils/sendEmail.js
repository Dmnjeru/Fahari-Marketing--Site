// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 * Robust sendEmail helper
 * - Loads backend/.env automatically if SMTP env not present
 * - Fail-fast in production if SMTP creds missing
 * - Verify transporter at startup (throws in production)
 * - Supports attachments (CVs, etc.)
 * - Exports named + default sendEmail
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

// If SMTP env looks missing, attempt to load backend/.env (helps when running from project root)
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  try {
    const envPath = join(__dirname, "..", ".env"); // backend/.env
    dotenv.config({ path: envPath });
    logger.debug && logger.debug(`dotenv: attempted to load env from ${envPath}`);
  } catch (err) {
    // ignore; we'll validate below
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

// Validate required SMTP fields
const missing = [];
if (!SMTP_HOST) missing.push("SMTP_HOST");
if (!SMTP_PORT) missing.push("SMTP_PORT");
if (!SMTP_USER) missing.push("SMTP_USER");
if (!SMTP_PASS) missing.push("SMTP_PASS");

// If missing critical fields, decide behavior: fail in prod, log in dev
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

// Create transporter only if we have credentials
if (missing.length === 0) {
  const portNum = Number(SMTP_PORT || 465);
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
      rejectUnauthorized: isProd,
    },
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: isDev,
  });

  // Verify transporter on startup. Fail-fast in production.
  (async () => {
    try {
      await transporter.verify();
      logger.info(`✅ SMTP verified (host=${SMTP_HOST}, port=${portNum}, secure=${secure})`);
    } catch (err) {
      logger.error(`❌ SMTP verification failed: ${(err && err.message) || err}`);
      if (isProd) {
        throw new Error(`SMTP verification failed in production: ${(err && err.message) || err}`);
      } else {
        logger.warn("Continuing in dev mode despite SMTP verification failure (log-only).");
        transporter = null;
      }
    }
  })();
}

/**
 * Send an email (or log if transporter not configured)
 * @param {Object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {string} [opts.from]
 * @param {Array}  [opts.attachments] - Nodemailer attachments array
 */
export async function sendEmail({ to, subject, text, html, from, attachments } = {}) {
  if (!to || !subject) {
    throw new Error("sendEmail: 'to' and 'subject' are required");
  }

  // Log-only mode if transporter not configured
  if (!transporter) {
    logger.info("📧 [LOG ONLY] Email would be sent (transporter not configured):", {
      to,
      subject,
      from: from ?? FROM_EMAIL ?? SMTP_USER,
      attachmentsCount: attachments?.length ?? 0,
    });
    logger.debug && logger.debug("Email payload:", { text, html, attachments });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to,
    subject,
    text,
    html,
    attachments, // ✅ now forwarded
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
