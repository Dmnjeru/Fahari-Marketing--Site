// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import logger from "../config/logger.js";

/**
 * Core resilient mailer
 * - Loads backend/.env explicitly
 * - Maintains transporter with verification
 * - In-memory persistent-ish queue (survives runtime restarts only)
 * - Retries with exponential backoff
 * - Auto re-init / health-check loop
 *
 * NOTE: For true persistence across process restarts use a DB-backed queue (recommended later).
 */

// ----------------- Load env (ensure backend/.env is used) -----------------
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

// ----------------- Env -----------------
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

// ----------------- Init transporter -----------------
export async function initMailer(force = false) {
  if (transporter && smtpConfigured && !force) return transporter;
  if (isVerifying) return transporter;

  isVerifying = true;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const msg = "⚠️ Missing SMTP credentials. Mailer running in log-only mode.";
    logger.warn(msg);
    smtpConfigured = false;
    isVerifying = false;
    return null;
  }

  try {
    const secure = SMTP_SECURE === "true" || Number(SMTP_PORT) === 465;

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      tls: { rejectUnauthorized: isProd }, // strict in prod
      pool: true, // keep connections alive for stability
      maxConnections: 5,
      maxMessages: 100,
      debug: isDev ? true : false,
      connectionTimeout: 30_000,
    });

    // verify connection
    await transporter.verify();
    smtpConfigured = true;
    logger.info(
      `✅ SMTP verified: host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${secure}`
    );
    // kick the queue processor if jobs are waiting
    processQueue().catch((err) =>
      logger.error("Queue processing error after init:", err)
    );
    return transporter;
  } catch (err) {
    smtpConfigured = false;
    logger.error("❌ SMTP verify failed:", err?.message || err);
    // In production we keep trying; do not crash here (the worker will retry init)
    return null;
  } finally {
    isVerifying = false;
  }
}

// ----------------- Exponential backoff helper -----------------
function getBackoffDelay(retries) {
  // exponential: BASE * 2^(retries-1), with jitter
  const exp = BASE_RETRY_DELAY_MS * Math.pow(2, Math.max(0, retries - 1));
  const jitter = Math.floor(Math.random() * BASE_RETRY_DELAY_MS * 0.25); // up to 25% jitter
  return exp + jitter;
}

// ----------------- Internal send attempt -----------------
async function attemptSend({ to, subject, text, html, from }) {
  if (!to || !subject) throw new Error("sendEmail requires 'to' and 'subject'");

  // ensure transporter available
  if (!transporter || !smtpConfigured) {
    await initMailer();
  }

  // If still not configured → log-only fallback
  if (!smtpConfigured || !transporter) {
    logger.info(`📧 [LOG-ONLY] to=${to}, subject=${subject}`);
    logger.debug && logger.debug("Body:", { text, html });
    return { logged: true };
  }

  const mailOptions = {
    from: from ?? FROM_EMAIL ?? `"Fahari Yoghurt" <${SMTP_USER}>`,
    to,
    subject,
    text: text ?? "",
    html: html ?? "",
  };

  // actually send
  const info = await transporter.sendMail(mailOptions);
  return info;
}

// ----------------- Queue processor -----------------
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (emailQueue.length > 0) {
      // ensure transporter before attempting sends
      if (!smtpConfigured) {
        await initMailer();
        // if still not configured, wait a bit to avoid busy-loop
        if (!smtpConfigured) {
          logger.warn("SMTP not configured - pausing queue processing for 5s");
          await sleep(5000);
          // continue loop to re-check, but break to let other tasks run
          continue;
        }
      }

      const job = emailQueue.shift();
      const { options, resolve, reject } = job;

      try {
        logger.info(`📤 Sending email to=${options.to} subject="${options.subject}" (attempt ${job.retries + 1})`);
        const result = await attemptSend(options);
        logger.info(`✅ Sent email to=${options.to} messageId=${result?.messageId ?? "N/A"}`);
        resolve(result);
      } catch (err) {
        job.retries = (job.retries || 0) + 1;

        // Detect transient errors (simple heuristic)
        const transient =
          ["ETIMEDOUT", "ECONNRESET", "EENVELOPE", "ECONNREFUSED", "ENOTFOUND"].includes(err?.code) ||
          (err?.responseCode && Number(err.responseCode) >= 400 && Number(err.responseCode) < 500);

        if (transient && job.retries <= MAX_RETRIES) {
          const delay = getBackoffDelay(job.retries);
          logger.warn(`⚠️ Transient send error (to=${options.to}) - will retry in ${Math.round(delay / 1000)}s. error=${err?.message || err}`);
          setTimeout(() => {
            emailQueue.push(job);
            // schedule processing again
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
/**
 * Enqueue an email for delivery. Returns a Promise that resolves once the email
 * has been successfully delivered (or resolves with {logged:true} in dev mode),
 * or rejects if the job permanently fails after retries.
 *
 * options: { to, subject, text, html, from }
 */
export function sendEmail(options) {
  return new Promise((resolve, reject) => {
    const job = {
      options,
      resolve,
      reject,
      retries: 0,
      enqueuedAt: Date.now(),
    };

    emailQueue.push(job);
    // start processing if not already running
    processQueue().catch((err) => logger.error("processQueue error:", err));
  });
}

// Alias for convenience (some callers may expect .send)
export const send = (opts) => sendEmail(opts);

// ----------------- Background health-check to keep SMTP warm -----------------
setInterval(async () => {
  try {
    if (!smtpConfigured) {
      await initMailer();
    } else if (transporter && smtpConfigured && isProd === false) {
      // optionally verify in dev only if debug needed; skip heavy checks in prod frequently
      // keep minimal: noop
    }
  } catch (err) {
    logger.warn("Mailer health-check failed:", err?.message || err);
  }
}, HEALTH_CHECK_INTERVAL_MS);

// ----------------- Export -----------------
export default { sendEmail, send, initMailer };
