// backend/utils/smtpConfig.ts
import nodemailer from "nodemailer";
import logger from "../config/logger.js"; // adjust path if needed

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  NODE_ENV,
  SMTP_CONNECTION_TIMEOUT_MS,
  FROM_EMAIL,
} = process.env;

const isProd = NODE_ENV === "production";

// Validate ENV variables
const missingVars = [];
if (!SMTP_HOST) missingVars.push("SMTP_HOST");
if (!SMTP_PORT) missingVars.push("SMTP_PORT");
if (!SMTP_USER) missingVars.push("SMTP_USER");
if (!SMTP_PASS) missingVars.push("SMTP_PASS");

if (missingVars.length > 0) {
  const msg = `❌ Missing SMTP configuration: ${missingVars.join(
    ", "
  )}. Please check your .env file.`;

  if (isProd) {
    logger.error(msg);
    process.exit(1); // Hard fail in production
  } else {
    logger.warn(`${msg} (DEV MODE → will NOT send real emails)`);
  }
}

// Prepare transport config only if all vars exist
let transporter: nodemailer.Transporter | null = null;

if (missingVars.length === 0) {
  const smtpPortNum = Number(SMTP_PORT);
  const secure = smtpPortNum === 465 || SMTP_SECURE === "true";

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: smtpPortNum,
    secure, // true for 465 (TLS)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: isProd,
    },
    connectionTimeout: Number(SMTP_CONNECTION_TIMEOUT_MS ?? 30000),
  });

  // Verify transporter only if in prod
  if (isProd) {
    transporter
      .verify()
      .then(() => {
        logger.info(
          `✅ SMTP verified: host=${SMTP_HOST}, port=${smtpPortNum}, secure=${secure}`
        );
      })
      .catch((err) => {
        logger.error(`❌ SMTP verification failed: ${err.message}`);
        process.exit(1);
      });
  } else {
    logger.info(
      `📧 [DEV] SMTP ready → host=${SMTP_HOST}, port=${smtpPortNum}, secure=${secure}`
    );
  }
} else {
  logger.warn("📧 [DEV] No SMTP transporter created (missing env vars).");
}

/**
 * Type-safe mail options
 */
export type MailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename?: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
};

/**
 * Safe sendMail wrapper (no-op in dev if transporter is null)
 */
export async function sendMail(opts: MailOptions) {
  if (!transporter) {
    logger.warn(
      `📧 [DEV] Skipping email send → subject="${opts.subject}", to=${opts.to}`
    );
    return { skipped: true };
  }

  const mailOpts = {
    from: opts.from ?? FROM_EMAIL ?? SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments,
    headers: opts.headers,
  };

  try {
    const info = await transporter.sendMail(mailOpts);
    if (!isProd) {
      logger.info(`📧 [DEV] Email sent → ${opts.to} (${info.messageId})`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) logger.info(`Preview URL: ${preview}`);
    }
    return info;
  } catch (error: any) {
    logger.error(
      `❌ Failed to send email: ${opts.subject} → ${opts.to} → ${error.message}`
    );
    throw error;
  }
}

export default transporter;
