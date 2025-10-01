// backend/utils/formRouter.js
import { sendEmail } from "./emailSender.js";
import logger from "../config/logger.js";

// ------------------- Recipient Map -------------------
const formRecipients = {
  contact: "info@faharidairies.co.ke",
  quote: "sales@faharidairies.co.ke",
  careers: "careers@faharidairies.co.ke",
  support: "support@faharidairies.co.ke",
  hr: "hr@faharidairies.co.ke",
};

// ------------------- Subject Map -------------------
const formSubjects = {
  contact: "📩 New message from Contact Form",
  quote: "📊 New Quote Request",
  careers: "👔 New Job Application",
  support: "🛟 Support Request",
};

/**
 * Escape HTML special characters in values
 */
function sanitize(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Routes a form submission to the appropriate email recipient
 * @param {string} formName - e.g. "contact", "quote", "careers", etc.
 * @param {Object} formData - key-value pairs from the form
 */
export async function routeFormSubmission(formName, formData) {
  const normalizedForm = formName?.toLowerCase().trim();
  const toEmail = formRecipients[normalizedForm];
  const subject =
    formSubjects[normalizedForm] || `📨 New message from "${formName}" form`;

  if (!normalizedForm || !toEmail) {
    logger.error(`❌ No recipient configured for form "${formName}"`);
    throw new Error(`No recipient configured for form "${formName}"`);
  }

  // Validate form data (prevent empty submissions)
  if (!formData || Object.keys(formData).length === 0) {
    logger.warn(`⚠️ Empty form data received for "${formName}" — skipping email`);
    throw new Error("Form submission contained no data.");
  }

  // Build HTML email (sanitized)
  const htmlRows = Object.entries(formData)
    .map(
      ([key, value]) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; text-transform: capitalize;">
            ${sanitize(key)}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            ${sanitize(value)}
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h2 style="color: #2c3e50; margin-bottom: 15px;">${subject}</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        ${htmlRows}
      </table>
    </div>
  `;

  // Plain text fallback
  const text = Object.entries(formData)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  // Log incoming submission (safe snapshot)
  logger.info(`📝 Received form submission: ${formName}`, {
    keys: Object.keys(formData),
    to: toEmail,
  });

  try {
    const result = await sendEmail({
      to: toEmail,
      subject,
      html,
      text,
    });

    logger.info(`✅ Form "${formName}" routed successfully to ${toEmail}`);
    return result;
  } catch (err) {
    logger.error(`❌ Failed to route form "${formName}": ${err?.message || err}`);
    throw err;
  }
}
