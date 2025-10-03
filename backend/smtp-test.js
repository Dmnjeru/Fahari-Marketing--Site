import express from "express";
import { sendEmail } from "./utils/mailer.js";

const router = express.Router();

/**
 * GET /api/smtp-test
 * Triggers a test email using your existing sendEmail() helper
 */
router.get("/smtp-test", async (req, res) => {
  try {
    console.log("📨 Sending test email...");

    const result = await sendEmail({
      to: "njerudennis86@gmail.com", // replace with your test email
      subject: "✅ SMTP Test from Render",
      text: "This is a test email triggered via /api/smtp-test",
    });

    console.log("✅ Email sent:", result);

    res.json({
      success: true,
      message: "✅ Email sent successfully",
      result,
    });
  } catch (err) {
    console.error("❌ SMTP failed:", err);
    res.status(500).json({
      success: false,
      message: "❌ SMTP failed",
      error: err.message,
    });
  }
});

export default router;
