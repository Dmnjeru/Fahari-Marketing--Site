// backend/utils/r2.js
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import logger from "../config/logger.js";

let r2Client = null;
let bucket = null;

/**
 * Initialize Cloudflare R2 client
 * Should be called once during app startup
 */
export function initR2() {
  const {
    CLOUDFLARE_R2_ENDPOINT,
    CLOUDFLARE_R2_KEY,
    CLOUDFLARE_R2_SECRET,
    CLOUDFLARE_R2_BUCKET,
  } = process.env;

  if (!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_R2_KEY || !CLOUDFLARE_R2_SECRET || !CLOUDFLARE_R2_BUCKET) {
    logger.error("❌ R2: Missing required env variables. Skipping R2 initialization.");
    return false;
  }

  try {
    r2Client = new S3Client({
      region: "auto",
      endpoint: CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_KEY,
        secretAccessKey: CLOUDFLARE_R2_SECRET,
      },
    });

    bucket = CLOUDFLARE_R2_BUCKET;

    logger.info(`✅ R2 initialized → bucket="${bucket}", endpoint="${CLOUDFLARE_R2_ENDPOINT}"`);
    return true;
  } catch (err) {
    logger.error("❌ Failed to initialize R2 client:", err);
    return false;
  }
}

/**
 * Upload file to Cloudflare R2
 * @param {string} key - Path/key to store object under
 * @param {Buffer|Uint8Array|string} body - File content
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} File key (not public URL)
 */
export async function uploadFileToR2(key, body, contentType) {
  if (!r2Client) {
    throw new Error("R2 not initialized. Call initR2() during server startup.");
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await r2Client.send(command);
    logger.info(`📤 Uploaded to R2: key="${key}"`);
    return key; // Return just the key, not public URL
  } catch (err) {
    logger.error(`❌ Failed to upload to R2: key="${key}", error=${err.message}`);
    throw err;
  }
}

/**
 * Generate a signed URL for downloading a file from R2
 * @param {string} key - Object key in the bucket
 * @param {number} expiresIn - Expiration in seconds (default 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrlForR2(key, expiresIn = 3600) {
  if (!r2Client) throw new Error("R2 not initialized");

  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn });
    logger.info(`🔑 Generated signed URL for key="${key}"`);
    return url;
  } catch (err) {
    logger.error(`❌ Failed to generate signed URL for key="${key}": ${err.message}`);
    throw err;
  }
}
