// Step 6: backend/smtp-test.js
import { sendEmail } from "./utils/mailer.js";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

// ----------------- Test Email -----------------
(async () => {
  try {
    console.log("📨 Sending test email via Resend SMTP...");

    const result = await sendEmail({
      to: process.env.TEST_EMAIL || "njerudennis86@gmail.com",
      subject: "✅ Test Email from Resend",
      text: "This is a test email sent via Resend SMTP from Node.js.",
      html: "<p>This is a test email sent via <b>Resend SMTP</b> from Node.js.</p>",
      from: process.env.FROM_EMAIL, // ensures verified domain
    });

    console.log("✅ Email sent successfully!");
    console.log("MessageId:", result?.messageId ?? "N/A");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to send email:", err?.message || err);
    process.exit(1);
  }
})();
