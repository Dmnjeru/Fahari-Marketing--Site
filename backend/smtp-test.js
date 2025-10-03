import { sendEmail } from "./utils/mailer.js";

(async () => {
  try {
    console.log("📨 Sending test email...");
    const result = await sendEmail({
      to: "yourpersonal@gmail.com", // your email
      subject: "✅ SMTP Test from Render",
      text: "This is a test email directly from smtp-test.js",
    });
    console.log("✅ Email sent:", result);
    process.exit(0);
  } catch (err) {
    console.error("❌ SMTP failed:", err);
    process.exit(1);
  }
})();
