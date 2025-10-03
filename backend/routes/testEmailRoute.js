// backend/routes/testEmailRoute.js
import express from "express";
import mailer from "../utils/mailer.js";
import logger from "../config/logger.js";

const router = express.Router();

/**
 * 📧 Test Email Route
 * -------------------
 * Endpoint: /api/test-email
 *
 * Purpose:
 *   - To verify email sending works in the deployed environment (e.g., Render).
 *   - Useful for debugging SMTP configuration issues.
 *
 * Usage:
 *   GET  /api/test-email?to=you@example.com
 *   POST /api/test-email { "to": "you@example.com" }
 *
 * Safety:
 *   - Should only be used temporarily during setup or debugging.
 *   - Consider protecting this route with an API key or admin auth in production.
 */
router.all("/", async (req, res) => {
  // Allow ?to= param OR { to } in request body. Fallback to developer email.
  const recipient =
    req.query.to || req.body.to || "njerudennis86@gmail.com";

  logger.info(`[Test Email] Attempting to send test email to ${recipient}`);

  try {
    // Construct test message
    const subject = "🚀 Render Mailer Test — Fahari Yoghurt & Dairies";
    const text = "Plain text fallback: If you see this, the mailer works ✅";
    const html = `
      <h1>✅ Render Mailer Test</h1>
      <p>If you received this email, the mailer is configured and working correctly!</p>
      <p><b>Environment:</b> ${process.env.NODE_ENV || "development"}</p>
      <p><b>Time:</b> ${new Date().toLocaleString()}</p>
    `;

    // Send email
    const info = await mailer.sendEmail({
      to: recipient,
      subject,
      text,
      html,
      from: process.env.FROM_EMAIL || "noreply@faharidairies.co.ke",
    });

    // Log success
    logger.info("[Test Email] ✅ Email sent successfully", {
      to: recipient,
      messageId: info?.messageId ?? "N/A",
    });

    return res.status(200).json({
      success: true,
      message: `📧 Test email sent successfully to ${recipient}. Check your inbox.`,
      data: {
        to: recipient,
        messageId: info?.messageId ?? "N/A",
      },
    });
  } catch (err) {
    // Log failure
    logger.error("[Test Email] ❌ Failed to send test email", {
      to: recipient,
      error: err?.message || String(err),
    });

    return res.status(500).json({
      success: false,
      message: "❌ Failed to send test email. Check server logs for details.",
      error: err?.message || String(err),
    });
  }
});

export default router;
