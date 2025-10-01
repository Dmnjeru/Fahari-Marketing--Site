// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import logger from "../config/logger.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load backend/.env if SMTP env not present
if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  try {
    const envPath = join(__dirname, "..", ".env");
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
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: isProd, // enforce cert validity in prod
    },
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: isDev, // never enable debug in prod
  });

  // Verify transporter on startup
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
 * Retry wrapper for transient errors
 */
async function attemptSend(mailOptions, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (err) {
      const code = err?.responseCode || err?.code;
      logger.warn(`⚠️ Email send failed (attempt ${i + 1}/${retries}): ${err.message}`);

      // Retry only on transient errors
      if (code === 451 || code === "ETIMEDOUT" || code === "ECONNRESET") {
        if (i < retries - 1) {
          logger.info(`⏳ Retrying in ${delay / 1000}s...`);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }
      }
      throw err;
    }
  }
}

/**
 * Send an email (or log if transporter not configured)
 * @param {Object} opts
 * @param {string|string[]} opts.to
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 */
export async function sendEmail({ to, subject, text, html } = {}) {
  if (!to || !subject) {
    throw new Error("sendEmail: 'to' and 'subject' are required");
  }

  // Block sending to same noreply address
  const noreply = FROM_EMAIL || SMTP_USER || "noreply@faharidairies.co.ke";
  if (
    (Array.isArray(to) && to.includes(noreply)) ||
    (!Array.isArray(to) && to === noreply)
  ) {
    logger.error("❌ Attempted to send email TO noreply address — blocked.");
    throw new Error("Invalid recipient: cannot send to noreply address.");
  }

  // If transporter not present
  if (!transporter) {
    logger.info("📧 [LOG ONLY] Email would be sent:", {
      to,
      subject,
      from: noreply,
    });
    logger.debug && logger.debug("Email payload:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: `"Fahari Yoghurt" <${noreply}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await attemptSend(mailOptions, 3, 5000);
    logger.info(`📧 Email sent: ${subject} → ${Array.isArray(to) ? to.join(",") : to} (id=${info.messageId})`);

    if (isDev) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info("📨 Preview URL:", preview);
      logger.debug && logger.debug("SMTP send info:", info);
    }

    return info;
  } catch (err) {
    logger.error(`❌ Failed to send email permanently: ${(err && err.message) || err}`, {
      subject,
      to,
    });
    throw err;
  }
}

export default sendEmail;
