// backend/utils/smtpConfig.ts
import logger from "../config/logger.js";
import { sendEmail as coreSendEmail } from "./mailer.js";

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
 * Type-safe sendMail wrapper for TS code.
 * Delegates all logic (retry, queue, reconnect) to mailer.js.
 */
export async function sendMail(opts: MailOptions) {
  if (!opts.to || !opts.subject) {
    throw new Error("sendMail: 'to' and 'subject' are required");
  }

  try {
    const result = await coreSendEmail(opts);
    logger.info(`📨 [smtpConfig.ts] Email delivered → ${opts.to}`);
    return result;
  } catch (err: any) {
    logger.error(
      `❌ [smtpConfig.ts] Failed to send email → ${opts.to}: ${err.message}`
    );
    throw err;
  }
}

export default { sendMail };
