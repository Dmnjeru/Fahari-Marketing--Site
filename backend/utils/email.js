// backend/utils/email.js
import logger from "../config/logger.js";
import { sendEmail as coreSendEmail } from "./mailer.js";

/**
 * Thin wrapper around core mailer.
 * Use this for backwards compatibility in places that still import `email.js`.
 * Ensures all delivery passes through the resilient mailer with retries + queue.
 *
 * @param {Object} options
 * @param {string|string[]} options.to - recipient(s)
 * @param {string} options.subject - subject line
 * @param {string} [options.text] - plain text body
 * @param {string} [options.html] - HTML body
 * @param {string} [options.from] - override sender
 */
export async function sendEmail({ to, subject, text, html, from }) {
  if (!to || !subject) {
    throw new Error("sendEmail: 'to' and 'subject' are required");
  }

  try {
    const result = await coreSendEmail({ to, subject, text, html, from });
    logger.info(`📨 [email.js] Routed email → ${Array.isArray(to) ? to.join(",") : to}`);
    return result;
  } catch (err) {
    logger.error(`❌ [email.js] Failed to send email: ${err.message}`);
    throw err;
  }
}

export default { sendEmail };
