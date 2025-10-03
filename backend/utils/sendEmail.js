// backend/utils/sendEmail.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import logger from "../config/logger.js";

/**
 * Core resilient mailer
 * - Uses Resend SMTP
 * - Maintains transporter with verification
 * - In-memory persistent-ish queue
 * - Retries with exponential backoff
 * - Auto re-init / health-check loop
 */

// ----------------- Load env (ensure backend/.env is used) -----------------
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

// ----------------- Env -----------------
const { FROM_EMAIL, NODE_ENV, RESEND_API_KEY } = process.env;

const isProd = NODE_ENV === "production";
const isDev = !isProd;

// ----------------- Transporter State -----------------
let transporter = null;
let smtpConfigured = false;
let isVerifying = false;

// ----------------- Queue State -----------------
const emailQueue = [];
let isProcessing = false;

// Retry policy
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 5000; // base delay in ms

// Health-check interval (try re-init when SMTP down)
const HEALTH_CHECK_INTERVAL_MS = 30_000; // 30s

// ----------------- Helper: sleep -----------------
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ----------------- Init transporter (Resend) -----------------
export async function initMailer(force = false) {
  if (transporter && smtpConfigured && !force) return transporter;
  if (isVerifying) return transporter;

  isVerifying = true;

  if (!RESEND_API_KEY) {
    const msg = "⚠️ Missing RESEND_API_KEY. Mailer running in log-only mode.";
    logger.warn(msg);
    smtpConfigured = false;
    isVerifying = false;
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: "resend",
        pass: RESEND_API_KEY,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      debug: isDev ? true : false,
      connectionTimeout: 30_000,
    });

    await transporter.verify();
    smtpConfigured = true;
    logger.info("✅ Resend SMTP verified successfully.");
    
    // kick queue if jobs are waiting
    processQueue().catch((err) =>
      logger.error("Queue processing error after init:", err)
    );

    return transporter;
  } catch (err) {
    smtpConfigured = false;
    logger.error("❌ Resend SMTP verify failed:", err?.message || err);
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

// ----------------- Internal send attempt -----------------
async function attemptSend({ to, subject, text, html, from }) {
  if (!to || !subject) throw new Error("sendEmail requires 'to' and 'subject'");

  if (!transporter || !smtpConfigured) {
    await initMailer();
  }

  if (!smtpConfigured || !transporter) {
    logger.info(`📧 [LOG-ONLY] to=${to}, subject=${subject}`);
    logger.debug && logger.debug("Body:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? '"Fahari Yoghurt & Dairies" <noreply@faharidairies.co.ke>',
    to,
    subject,
    text: text ?? "",
    html: html ?? "",
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

// ----------------- Queue processor -----------------
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (emailQueue.length > 0) {
      if (!smtpConfigured) {
        await initMailer();
        if (!smtpConfigured) {
          logger.warn("SMTP not configured - pausing queue processing for 5s");
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
        const result = await attemptSend(options);
        logger.info(`✅ Sent email to=${options.to} messageId=${result?.messageId ?? "N/A"}`);
        resolve(result);
      } catch (err) {
        job.retries = (job.retries || 0) + 1;

        const transient =
          ["ETIMEDOUT", "ECONNRESET", "EENVELOPE", "ECONNREFUSED", "ENOTFOUND"].includes(err?.code) ||
          (err?.responseCode && Number(err.responseCode) >= 400 && Number(err.responseCode) < 500);

        if (transient && job.retries <= MAX_RETRIES) {
          const delay = getBackoffDelay(job.retries);
          logger.warn(
            `⚠️ Transient send error (to=${options.to}) - retry in ${Math.round(delay / 1000)}s. error=${err?.message || err}`
          );
          setTimeout(() => {
            emailQueue.push(job);
            processQueue().catch((e) => logger.error("processQueue error on retry:", e));
          }, delay);
        } else {
          logger.error(`❌ Permanent failure for to=${options.to} after ${job.retries} attempts: ${err?.message || err}`);
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

// ----------------- Public API: sendEmail -----------------
export function sendEmail(options) {
  return new Promise((resolve, reject) => {
    const job = { options, resolve, reject, retries: 0, enqueuedAt: Date.now() };
    emailQueue.push(job);
    processQueue().catch((err) => logger.error("processQueue error:", err));
  });
}

export const send = (opts) => sendEmail(opts);

// ----------------- Background health-check -----------------
setInterval(async () => {
  try {
    if (!smtpConfigured) await initMailer();
  } catch (err) {
    logger.warn("Mailer health-check failed:", err?.message || err);
  }
}, HEALTH_CHECK_INTERVAL_MS);

// ----------------- Export -----------------
export default { sendEmail, send, initMailer };

