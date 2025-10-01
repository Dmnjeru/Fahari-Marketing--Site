// backend/utils/r2Uploader.js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../config/logger.js";

let r2Client = null;
let bucket = null;
let endpoint = null;

/**
 * Initialize Cloudflare R2 client lazily.
 * Safe to call multiple times; reuses existing client if already initialized.
 * @returns {boolean} true if initialized successfully
 */
export function initR2Uploader() {
  if (r2Client) return true;

  const {
    R2_ENDPOINT,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
  } = process.env;

  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    logger.warn("⚠️ R2 uploader not configured. Missing environment variables.");
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

    logger.info(`✅ R2 uploader initialized (bucket="${bucket}", endpoint="${endpoint}")`);
    return true;
  } catch (err) {
    logger.error(`❌ Failed to initialize R2 uploader: ${err?.message ?? err}`);
    r2Client = null;
    bucket = null;
    endpoint = null;
    return false;
  }
}

/**
 * Upload a file to R2 and generate a signed URL
 * @param {Buffer|Uint8Array|string} fileBuffer - File content
 * @param {string} fileName - Original file name
 * @param {string} [folder=""] - Optional folder path in bucket
 * @param {number} [expiresIn=3600] - Signed URL expiration in seconds (default 1 hour)
 * @returns {Promise<{ key: string, signedUrl: string, result: object }>}
 */
export async function uploadFileToR2(fileBuffer, fileName, folder = "", expiresIn = 3600) {
  if (!fileBuffer || !fileName) {
    throw new Error("uploadFileToR2: fileBuffer and fileName are required");
  }

  if (!r2Client) {
    const ok = initR2Uploader();
    if (!ok) throw new Error("R2 uploader is not initialized (missing env vars)");
  }

  const timestamp = Date.now();
  const sanitizedName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 240);
  const key = folder ? `${folder}/${timestamp}-${sanitizedName}` : `${timestamp}-${sanitizedName}`;

  try {
    // Upload the file
    const result = await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
      })
    );

    // Generate signed URL
    const signedUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn }
    );

    logger.info(`📤 R2 upload successful: ${key} → signed URL (expires in ${expiresIn}s)`);
    return { key, signedUrl, result };
  } catch (err) {
    logger.error(`❌ R2 upload failed for key="${key}": ${err?.message ?? err}`);
    throw err;
  }
}

/* --------------------------- Default Export --------------------------- */
export default {
  initR2Uploader,
  uploadFileToR2,
};
