import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Fahari Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "SMTP Test Email",
      text: "Hello! This is a test email from Fahari backend.",
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Email failed:", err);
  }
}

testEmail();
