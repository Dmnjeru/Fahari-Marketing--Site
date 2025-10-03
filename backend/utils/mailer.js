// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import logger from "../config/logger.js";

/**
 * ✉️ Resilient mailer
 * - Dev: uses Resend SMTP with retries, queue, health-check
 * - Prod (Render): skips SMTP (blocked) → uses Resend HTTPS API
 * - Unified API: sendEmail({ to, subject, text, html })
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

const { FROM_EMAIL, NODE_ENV, RESEND_API_KEY } = process.env;
const isProd = NODE_ENV === "production";
const isDev = !isProd;

// ----------------- Transporter State (for dev/local only) -----------------
let transporter = null;
let smtpConfigured = false;
let isVerifying = false;

// ----------------- Queue State -----------------
const emailQueue = [];
let isProcessing = false;
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 5000;
const HEALTH_CHECK_INTERVAL_MS = 30_000;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ----------------- Init transporter (Dev only) -----------------
async function initMailer(force = false) {
  if (isProd) return null; // 🚫 skip SMTP in production
  if (transporter && smtpConfigured && !force) return transporter;
  if (isVerifying) return transporter;

  isVerifying = true;

  if (!RESEND_API_KEY) {
    logger.warn("⚠️ Missing RESEND_API_KEY. Mailer running in log-only mode.");
    smtpConfigured = false;
    isVerifying = false;
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false,
      auth: { user: "resend", pass: RESEND_API_KEY },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      debug: isDev,
      connectionTimeout: 30_000,
    });

    await transporter.verify();
    smtpConfigured = true;
    logger.info("✅ Resend SMTP verified (dev mode).");

    processQueue().catch((err) =>
      logger.error("Queue processing error after init:", err)
    );
    return transporter;
  } catch (err) {
    smtpConfigured = false;
    logger.error("❌ SMTP verify failed:", err?.message || err);
    return null;
  } finally {
    isVerifying = false;
  }
}

// ----------------- Exponential backoff helper -----------------
function getBackoffDelay(retries) {
  const exp = BASE_RETRY_DELAY_MS * Math.pow(2, Math.max(0, retries - 1));
  const jitter = Math.floor(Math.random() * BASE_RETRY_DELAY_MS * 0.25);
  return exp + jitter;
}

// ----------------- Dev SMTP send attempt -----------------
async function attemptSendSMTP({ to, subject, text, html, from }) {
  if (!to || !subject) throw new Error("sendEmail requires 'to' and 'subject'");
  if (!transporter || !smtpConfigured) await initMailer();

  if (!smtpConfigured || !transporter) {
    logger.info(`📧 [LOG-ONLY] to=${to}, subject=${subject}`);
    return { logged: true };
  }

  const mailOptions = {
    from:
      from ??
      FROM_EMAIL ??
      '"Fahari Yoghurt & Dairies" <noreply@faharidairies.co.ke>',
    to,
    subject,
    text: text ?? "",
    html: html ?? "",
  };

  return await transporter.sendMail(mailOptions);
}

// ----------------- Queue processor (dev only) -----------------
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (emailQueue.length > 0) {
      if (!smtpConfigured) {
        await initMailer();
        if (!smtpConfigured) {
          logger.warn("SMTP not configured - pausing queue 5s");
          await sleep(5000);
          continue;
        }
      }

      const job = emailQueue.shift();
      const { options, resolve, reject } = job;

      try {
        logger.info(
          `📤 Sending email to=${options.to} subject="${options.subject}" (attempt ${job.retries + 1})`
        );
        const result = await attemptSendSMTP(options);
        logger.info(
          `✅ Sent email to=${options.to} messageId=${result?.messageId ?? "N/A"}`
        );
        resolve(result);
      } catch (err) {
        job.retries = (job.retries || 0) + 1;
        const transient =
          ["ETIMEDOUT", "ECONNRESET", "EENVELOPE", "ECONNREFUSED", "ENOTFOUND"].includes(
            err?.code
          ) ||
          (err?.responseCode &&
            Number(err.responseCode) >= 400 &&
            Number(err.responseCode) < 500);

        if (transient && job.retries <= MAX_RETRIES) {
          const delay = getBackoffDelay(job.retries);
          logger.warn(
            `⚠️ Transient send error (to=${options.to}) - retry in ${Math.round(
              delay / 1000
            )}s. error=${err?.message || err}`
          );
          setTimeout(() => {
            emailQueue.push(job);
            processQueue().catch((e) =>
              logger.error("processQueue error on retry:", e)
            );
          }, delay);
        } else {
          logger.error(
            `❌ Permanent failure for to=${options.to} after ${job.retries} attempts: ${err?.message || err}`
          );
          reject(err);
        }
      }
    }
  } catch (outerErr) {
    logger.error("❌ processQueue unexpected error:", outerErr);
  } finally {
    isProcessing = false;
  }
}

// ----------------- Prod: Resend API send -----------------
async function sendViaResendAPI({ to, subject, text, html, from }) {
  logger.info(`[Mailer] Using Resend API for to=${to}, subject=${subject}`);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:
        from ??
        FROM_EMAIL ??
        "Fahari <noreply@faharidairies.co.ke>",
      to,
      subject,
      text: text ?? "",
      html: html ?? "",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Resend API failed");

  logger.info(`[Mailer] ✅ Email queued via Resend API (id=${data?.id})`);
  return data;
}

// ----------------- Unified Public API -----------------
export function sendEmail(options) {
  if (isProd) {
    return sendViaResendAPI(options); // 🚀 Render safe
  }

  return new Promise((resolve, reject) => {
    const job = { options, resolve, reject, retries: 0, enqueuedAt: Date.now() };
    emailQueue.push(job);
    processQueue().catch((err) => logger.error("processQueue error:", err));
  });
}

// ----------------- Background health-check (dev only) -----------------
if (isDev) {
  setInterval(async () => {
    try {
      if (!smtpConfigured) await initMailer();
    } catch (err) {
      logger.warn("Mailer health-check failed:", err?.message || err);
    }
  }, HEALTH_CHECK_INTERVAL_MS);
}

// ----------------- Export -----------------
export default { sendEmail, initMailer };
