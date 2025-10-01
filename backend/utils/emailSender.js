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
let isVerifying = false;

// Email queue (in-memory)
const emailQueue = [];
let processingQueue = false;

// ----------------- Initialize Transporter -----------------
export async function initEmail(force = false) {
  if (smtpConfigured && transporter && !force) return true;
  if (isVerifying) return false; // avoid race

  isVerifying = true;

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
      isVerifying = false;
      return false;
    }
  }

  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
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
      `✅ SMTP verified: host=${SMTP_HOST}, port=${SMTP_PORT}, secure=${transporter.options.secure}`
    );
  } catch (err) {
    logger.error(`❌ SMTP verification failed: ${err?.message || err}`);
    smtpConfigured = false;
  } finally {
    isVerifying = false;
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

// ----------------- Retry Helper -----------------
async function retryWithBackoff(fn, retries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      const wait = delay * Math.pow(2, attempt - 1); // exponential
      logger.warn(`Retrying email send (attempt ${attempt}/${retries}) in ${wait}ms`);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
}

// ----------------- Queue Processor -----------------
async function processQueue() {
  if (processingQueue || !smtpConfigured) return;
  processingQueue = true;

  while (emailQueue.length > 0 && smtpConfigured) {
    const { options, resolve, reject } = emailQueue.shift();
    try {
      const result = await sendEmailInternal(options);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  }

  processingQueue = false;
}

// ----------------- Internal Send -----------------
async function sendEmailInternal({ to, subject, text, html, from }) {
  if (!subject || !to) throw new Error("sendEmail: 'to' and 'subject' are required");

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

  return retryWithBackoff(async () => {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(
        `📧 Email sent: to=${recipient}, subject=${subject}, messageId=${info.messageId}`
      );

      if (isDev) {
        const preview = nodemailer.getTestMessageUrl(info);
        if (preview) logger.info("Preview URL:", preview);
        logger.debug("SMTP send info:", info);
      }

      return info;
    } catch (err) {
      logger.error(`❌ Send failed (${recipient}): ${err?.message || err}`);
      // If connection issue → force re-init
      if (/ECONNECTION|ETIMEDOUT|ECONNRESET|ENOTFOUND/.test(err?.code || "")) {
        smtpConfigured = false;
        await initEmail(true); // force re-init
      }
      throw err;
    }
  });
}

// ----------------- Public Send -----------------
export async function sendEmail(options) {
  if (!smtpConfigured) {
    await initEmail();
  }

  return new Promise((resolve, reject) => {
    emailQueue.push({ options, resolve, reject });
    processQueue().catch((err) => {
      logger.error("❌ Queue processing error:", err);
    });
  });
}

// ----------------- Default Export -----------------
export default { initEmail, sendEmail };
