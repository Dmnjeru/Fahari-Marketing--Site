// backend/scripts/testR2.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function testR2() {
  console.log("🔧 Testing Cloudflare R2 upload...");

  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const key = "test-upload.txt";

  if (!endpoint || !bucket) {
    console.error("❌ Missing CLOUDFLARE_R2 environment variables.");
    process.exit(1);
  }

  const s3 = new S3Client({
    endpoint,
    region: "auto",
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_KEY,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET,
    },
  });

  try {
    // Prepare dummy file buffer
    const content = `Test file uploaded at ${new Date().toISOString()}`;
    const buffer = Buffer.from(content, "utf-8");

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: "text/plain",
    });

    await s3.send(command);

    console.log("✅ Upload successful!");
    console.log(
      `📂 File Key: ${key}\n🌍 URL: ${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
    );
  } catch (error) {
    console.error("❌ Upload failed:", error);
    process.exit(1);
  }
}

testR2();
