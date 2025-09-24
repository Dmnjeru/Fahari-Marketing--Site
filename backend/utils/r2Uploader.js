// backend/utils/r2Uploader.js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../config/logger.js";

let r2Client = null;
let bucket = null;
let endpoint = null;

/**
 * Initialize R2 client lazily (safe to call multiple times).
 */
export function initR2Uploader() {
  if (r2Client) return true;

  const {
    CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_KEY,
    CLOUDFLARE_R2_SECRET,
    CLOUDFLARE_R2_BUCKET,
  } = process.env;

  if (!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_KEY || !CLOUDFLARE_R2_SECRET || !CLOUDFLARE_R2_BUCKET) {
    logger.warn("⚠️ R2 uploader not configured. Missing env vars.");
    return false;
  }

  endpoint = CLOUDFLARE_R2_ENDPOINT.replace(/\/$/, "");
  bucket = CLOUDFLARE_R2_BUCKET;

  try {
    r2Client = new S3Client({
      endpoint,
      region: "auto",
      credentials: {
        accessKeyId: CLOUDFLARE_R2_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET,
      },
      forcePathStyle: false,
    });

    logger.info(`✅ R2 uploader initialized (bucket="${bucket}", endpoint="${endpoint}")`);
    return true;
  } catch (err) {
    logger.error(`❌ Failed to initialize R2 uploader: ${err.message}`);
    return false;
  }
}

/**
 * Upload a file buffer to R2 and return a signed URL for secure download
 * @param {Buffer|Uint8Array|string} fileBuffer
 * @param {string} fileName
 * @param {string} [folder]
 * @param {number} [expiresIn=3600] URL expiration in seconds (default 1 hour)
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
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = folder ? `${folder}/${timestamp}-${sanitizedName}` : `${timestamp}-${sanitizedName}`;

  try {
    const result = await r2Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
      })
    );

    // Generate a signed URL for secure access
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });

    logger.info(`📤 R2 upload success: ${key} → signed URL (expires in ${expiresIn}s)`);
    return { key, signedUrl, result };
  } catch (err) {
    logger.error(`❌ [R2] Upload failed for key="${key}": ${err.message}`);
    throw err;
  }
}
