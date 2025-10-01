// backend/utils/r2.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../config/logger.js";

let r2Client = null;
let bucket = null;
let endpoint = null;

/**
 * Initialize Cloudflare R2 client lazily.
 * Safe to call multiple times.
 * @returns {boolean} true if initialized successfully
 */
export function initR2() {
  if (r2Client) return true;

  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    logger.warn("⚠️ R2 not initialized. Missing environment variables.");
    return false;
  }

  endpoint = R2_ENDPOINT.replace(/\/$/, "");
  bucket = R2_BUCKET;

  try {
    r2Client = new S3Client({
      endpoint,
      region: "auto",
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: false,
    });

    logger.info(`✅ R2 initialized (bucket="${bucket}", endpoint="${endpoint}")`);
    return true;
  } catch (err) {
    logger.error("❌ Failed to initialize R2:", err?.message ?? err);
    r2Client = null;
    bucket = null;
    endpoint = null;
    return false;
  }
}

/**
 * Upload a file to R2 and return signed URL
 * @param {Buffer|Uint8Array|string} fileBuffer
 * @param {string} fileName
 * @param {string} [folder=""]
 * @param {number} [expiresIn=3600] - seconds
 */
export async function uploadFile(fileBuffer, fileName, folder = "", expiresIn = 3600) {
  if (!fileBuffer || !fileName) throw new Error("uploadFile: fileBuffer and fileName are required");

  if (!r2Client) {
    const ok = initR2();
    if (!ok) throw new Error("R2 client not initialized");
  }

  const timestamp = Date.now();
  const sanitizedName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 240);
  const key = folder ? `${folder}/${timestamp}-${sanitizedName}` : `${timestamp}-${sanitizedName}`;

  try {
    // Upload
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
      })
    );

    // Signed URL
    const signedUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn }
    );

    logger.info(`📤 R2 upload success: ${key} → signed URL`);
    return { key, signedUrl };
  } catch (err) {
    logger.error(`❌ R2 upload failed for key="${key}":`, err?.message ?? err);
    throw err;
  }
}

/**
 * Delete a file from R2
 * @param {string} key
 */
export async function deleteFile(key) {
  if (!r2Client) {
    const ok = initR2();
    if (!ok) throw new Error("R2 client not initialized");
  }

  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    logger.info(`🗑️ R2 file deleted: ${key}`);
    return true;
  } catch (err) {
    logger.error(`❌ Failed to delete R2 file: ${key}`, err?.message ?? err);
    throw err;
  }
}

/**
 * Generate a signed URL for an existing R2 object
 * @param {string} key
 * @param {number} [expiresIn=3600]
 */
export async function getSignedUrlForKey(key, expiresIn = 3600) {
  if (!r2Client) {
    const ok = initR2();
    if (!ok) throw new Error("R2 client not initialized");
  }

  try {
    const signedUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn }
    );
    return signedUrl;
  } catch (err) {
    logger.error(`❌ Failed to generate signed URL for key="${key}":`, err?.message ?? err);
    throw err;
  }
}

/* --------------------------- Default Export --------------------------- */
export default {
  initR2,
  uploadFile,
  deleteFile,
  getSignedUrlForKey,
};
