// scripts/testR2Upload.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { initR2Uploader, uploadFileToR2 } from "../utils/r2Uploader.js";

// -------------------------------
// Load .env
// -------------------------------
dotenv.config();
console.log("🔹 Loaded environment variables.");

// -------------------------------
// Prepare test file
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testFilePath = path.join(__dirname, "test-file.txt");

if (!fs.existsSync(testFilePath)) {
  fs.writeFileSync(testFilePath, "This is a test file for R2 upload.", "utf-8");
  console.log(`✅ Created test file at ${testFilePath}`);
}

// -------------------------------
// Main upload test
// -------------------------------
async function testUpload() {
  try {
    // Initialize R2
    const ok = initR2Uploader();
    if (!ok) {
      console.error("❌ R2 uploader not initialized. Check your .env vars.");
      return;
    }
    console.log("✅ R2 uploader initialized.");

    // Read file
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileName = path.basename(testFilePath);
    const folder = "test-uploads";
    const expirySeconds = 3600;

    // Upload
    const r2Key = await uploadFileToR2(fileBuffer, fileName, folder, expirySeconds);
    console.log("📤 Upload successful!");
    console.log("R2 Key:", r2Key);

    // Optional: generate a signed URL (if your uploader supports it)
    // const signedUrl = generateR2SignedUrl(r2Key, expirySeconds);
    // console.log("Signed URL:", signedUrl);

  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

testUpload();
