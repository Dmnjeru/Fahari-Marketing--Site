// scripts/testCareer.js
// =======================================================
// Automated Career API Test Script
// - Logs in as Admin
// - Creates a test Job
// - Submits a fake Candidate Application (with CV upload)
// - Sends a test email directly via mailer utility
// - Cleans up (deletes test Job)
// =======================================================

import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import mailer from "../utils/mailer.js"; // direct mailer import

// -------------------------------
// Load environment variables
// -------------------------------
dotenv.config();

const API_URL = process.env.BASE_URL || "http://localhost:5000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";
const TEST_EMAIL = process.env.TEST_EMAIL || "test-recipient@example.com";

// -------------------------------
// Helper to normalize IDs
// -------------------------------
function normalizeId(obj) {
  return obj?._id || obj?.id || null;
}

// -------------------------------
// Main test function
// -------------------------------
async function runCareerTest() {
  console.log("🔄 Starting Career API Test...");

  let jobId = null;
  let cvPath = null;
  let token = null;

  try {
    // 1️⃣ Admin Login
    console.log("📌 Logging in as admin...");
    const loginRes = await axios.post(`${API_URL}/api/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    token = loginRes.data?.token;
    if (!token) throw new Error("No token returned from login");
    console.log("✅ Admin login successful.");

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2️⃣ Create Test Job
    console.log("📌 Creating test job...");
    const jobRes = await axios.post(
      `${API_URL}/api/careers/jobs`,
      {
        title: "QA Test Job",
        slug: `qa-test-job-${Date.now()}`,
        description: "Temporary job created by automated test script.",
        location: "Nairobi",
        type: "Full-time",
        requirements: ["Attention to detail", "Basic coding knowledge"],
      },
      authHeaders
    );

    const jobData = jobRes.data?.job || jobRes.data?.data || jobRes.data;
    jobId = normalizeId(jobData);

    if (!jobId) {
      console.error("⚠️ Unexpected job creation response:", jobRes.data);
      throw new Error("Job creation failed: no job ID returned.");
    }
    console.log(`✅ Test job created (ID: ${jobId})`);

    // 3️⃣ Submit Application with CV
    console.log("📌 Submitting test application...");
    const form = new FormData();
    form.append("jobId", jobId);
    form.append("fullName", "John Doe");
    form.append("email", "john.doe@example.com");
    form.append("phone", "0712345678");
    form.append(
      "coverLetter",
      "This is a test cover letter for automated testing."
    );

    // Generate a dummy CV file in tmp folder (PDF)
    cvPath = path.join(process.cwd(), "tmp_test_cv.pdf");
    fs.writeFileSync(cvPath, "This is a fake CV PDF for testing Career API.");
    form.append("cv", fs.createReadStream(cvPath), {
      filename: "dummy.pdf",
      contentType: "application/pdf",
    });

    const appRes = await axios.post(`${API_URL}/api/careers/apply`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const appData = appRes.data?.application || appRes.data?.data || appRes.data;
    const appId = normalizeId(appData);

    if (!appId) {
      console.error("⚠️ Unexpected application response:", appRes.data);
      throw new Error("Application submission failed.");
    }
    console.log(`✅ Application submitted (ID: ${appId})`);

    // 4️⃣ Send Test Email directly via mailer utility
    console.log("📧 Sending test email via mailer utility...");
    const info = await mailer.sendEmail({
      to: TEST_EMAIL,
      subject: "Career API Test Email",
      text: "This is a test email from the automated Career API test script.",
      html: "<p>This is a test email from the automated <b>Career API test script</b>.</p>",
    });
    console.log("✅ Test email sent:", info.messageId);

    // 5️⃣ Delete Test Job (cleanup)
    console.log("🗑️ Cleaning up test job...");
    await axios.delete(`${API_URL}/api/careers/jobs/${jobId}`, authHeaders);
    console.log("✅ Test job deleted.");

    // Cleanup CV file
    if (cvPath && fs.existsSync(cvPath)) fs.unlinkSync(cvPath);

    console.log("🎉 Career API test finished successfully!");
  } catch (err) {
    console.error("❌ Career API test failed.");
    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      } else if (err.request) {
        console.error("No response from server.");
      } else {
        console.error("Message:", err.message);
      }
    } else {
      console.error("Message:", err.message);
    }

    // Cleanup orphaned job if created
    if (jobId && token) {
      try {
        console.log("🧹 Cleaning up orphaned test job...");
        await axios.delete(`${API_URL}/api/careers/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Orphaned job deleted.");
      } catch (cleanupErr) {
        console.error("⚠️ Cleanup failed:", cleanupErr.message);
      }
    }

    // Cleanup CV file
    if (cvPath && fs.existsSync(cvPath)) fs.unlinkSync(cvPath);

    process.exit(1);
  }
}

// -------------------------------
// Run script
// -------------------------------
runCareerTest();
