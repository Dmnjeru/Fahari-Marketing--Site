// scripts/testR2Creds.js
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT.replace(/\/$/, ""), // remove trailing slash
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
  forcePathStyle: true,
});

async function testBucket() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      MaxKeys: 5,
    });
    const data = await s3.send(command);
    console.log("✅ R2 bucket access confirmed. Files:", data.Contents?.map(f => f.Key) || []);
  } catch (err) {
    console.error("❌ R2 bucket access failed:", err.message);
  }
}

testBucket();
