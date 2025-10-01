// backend/scripts/testMailer.js
import dotenv from "dotenv";
import mailer from "../utils/mailer.js";

dotenv.config();

async function runTest() {
  console.log("🔄 Starting Mailer Test...");

  const testRecipient = process.env.TEST_EMAIL || "njerudennis86@gmail.com";

  try {
    const info = await mailer.sendEmail({
      to: testRecipient,
      subject: "✅ Fahari Mailer Test",
      text: "This is a test email from Fahari Yoghurt mailer system.",
      html: "<p>This is a <b>test email</b> from Fahari Yoghurt mailer system.</p>",
    });

    if (info?.logged) {
      console.log(`📋 Mail logged only (no SMTP). To=${testRecipient}`);
    } else {
      console.log("📧 Mailer responded:", info);
    }
  } catch (err) {
    console.error("🔥 Test script crashed:", err.message || err);
  }
}

runTest();
