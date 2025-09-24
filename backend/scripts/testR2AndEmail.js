// backend/utils/testR2AndEmail.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import r2 from "../utils/r2.js"; // make sure this path is correct
import emailHelper from "../utils/email.js"; // your existing email helper

async function testR2Upload() {
  try {
    console.log("🔹 Testing R2 upload...");
    // Example file: small text file
    const buffer = Buffer.from("Hello Fahari R2 test!");
    const key = `test/test-${Date.now()}.txt`;
    const url = await r2.uploadFileToR2(buffer, key, "text/plain");
    console.log("✅ R2 upload success! Public URL:", url);
  } catch (err) {
    console.error("⚠️ R2 upload failed:", err.message);
  }
}

async function testEmail() {
  try {
    console.log("🔹 Testing SMTP email...");
    await emailHelper.sendEmail({
      to: process.env.TEST_EMAIL || "your_email@example.com",
      subject: "Fahari Test Email",
      text: "This is a test email from Fahari backend.",
      html: "<p>This is a <strong>test email</strong> from Fahari backend.</p>",
    });
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("⚠️ Email sending failed:", err.message);
  }
}

async function runTests() {
  console.log("🧪 Starting tests...");
  await testR2Upload();
  await testEmail();
  console.log("🎯 All tests completed!");
}

runTests();
