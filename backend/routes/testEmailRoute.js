// backend/routes/testEmailRoute.js
import express from "express";
import mailer from "../utils/mailer.js";
import logger from "../config/logger.js";

const router = express.Router();

/**
 * 🔹 GET /api/test-email
 * - Simple endpoint to test if the email system works in the deployed environment.
 * - Sends a test email to a specified recipient.
 * - Returns JSON status to frontend and logs detailed info on the backend.
 * 
 * Safety:
 * - Should only be used temporarily for debugging.
 * - Avoid exposing publicly in production for spam prevention.
 */
router.get("/test-email", async (req, res) => {
  const testRecipient = "njerudennis86@gmail.com"; // <-- replace with your personal email

  logger.info(`[Test Email] Attempting to send test email to ${testRecipient}`);

  try {
    const info = await mailer.sendEmail({
      to: testRecipient,
      subject: "🚀 Render Mailer Test — Fahari Yoghurt & Dairies",
      text: "This is a plain text fallback. If you see this, the mailer is working.",
      html: `
        <h1>✅ Render Mailer Test</h1>
        <p>If you received this email, the mailer is configured and working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      from: process.env.FROM_EMAIL || "noreply@faharidairies.co.ke",
    });

    logger.info("[Test Email] Email sent successfully", {
      to: testRecipient,
      messageId: info?.messageId ?? "N/A",
    });

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully. Check your inbox!",
      data: {
        to: testRecipient,
        messageId: info?.messageId ?? "N/A",
      },
    });
  } catch (err) {
    logger.error("[Test Email] Failed to send test email", {
      to: testRecipient,
      error: err?.message || String(err),
    });

    return res.status(500).json({
      success: false,
      message: "Failed to send test email. Check server logs for details.",
      error: err?.message || String(err),
    });
  }
});

export default router;
