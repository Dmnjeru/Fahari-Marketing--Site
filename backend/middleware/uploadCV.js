// backend/middleware/uploadCV.js
import multer from "multer";
import logger from "../config/logger.js";
import { uploadFileToR2, initR2Uploader } from "../utils/r2Uploader.js";

/* ------------------ Config ------------------ */
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ------------------ Initialize R2 ------------------ */
if (!initR2Uploader()) {
  logger.warn("⚠️ Cloudflare R2 not initialized. CV uploads will fail.");
}

/* ------------------ Storage (memory for multer only) ------------------ */
const storage = multer.memoryStorage();

/* ------------------ Single CV upload middleware ------------------ */
export const uploadCvMiddleware = multer({
  storage,
  limits: { fileSize: MAX_CV_SIZE },
  fileFilter: (req, file, cb) => {
    if (!CV_TYPES.includes(file.mimetype)) {
      return cb(new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `CV must be PDF, DOC, or DOCX (got ${file.mimetype})`
      ));
    }
    cb(null, true);
  },
}).single("cv");

/* ------------------ Upload to R2 handler ------------------ */
export const uploadCvToR2 = async (req, res, next) => {
  try {
    if (!req.file) return next(); // no file uploaded

    const { buffer, originalname } = req.file;
    const folder = "careers-cvs";

    const { key, signedUrl } = await uploadFileToR2(buffer, originalname, folder, 60 * 60 * 24); // 24h signed URL
    logger.info(`CV uploaded to R2: ${key}`);

    // Attach R2 info to request for controller
    req.cvFile = { key, url: signedUrl };
    next();
  } catch (err) {
    logger.error(`Failed to upload CV to R2: ${err.message}`, { stack: err.stack });
    return res.status(500).json({ success: false, code: "CV_UPLOAD_ERROR", message: err.message || "Failed to upload CV" });
  }
};

/* ------------------ Combined middleware ------------------ */
export const handleCvUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.warn(`CV upload error: ${err.message}`, { field: err.field, code: err.code });
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, code: "CV_TOO_LARGE", message: "CV file exceeds the 5MB size limit" });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ success: false, code: "INVALID_CV_TYPE", message: err.message });
    }
  } else if (err) {
    logger.error(`Unknown CV upload error: ${err.message}`, { stack: err.stack });
    return res.status(500).json({ success: false, code: "CV_UPLOAD_ERROR", message: err.message || "Failed to upload CV" });
  }
  next();
};
