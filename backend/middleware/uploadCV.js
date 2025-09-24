// backend/middleware/uploadCV.js
import multer from "multer";

/**
 * Middleware: upload CV files
 * - Accepts single file under field name "cv"
 * - Max size: 5 MB
 * - Allowed types: PDF, DOC, DOCX
 * - Stored in memory for later R2 upload
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const storage = multer.memoryStorage(); // store file in memory buffer

export const uploadCvMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only PDF, DOC, DOCX allowed."
        )
      );
    }
  },
}).single("cv");

/**
 * Optional helper to catch multer errors in routes
 * Usage: app.post('/route', uploadCvMiddleware, handleErrors, controller)
 */
export const handleCvUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // File too large
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        code: "FILE_TOO_LARGE",
        message: `CV must be smaller than ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      });
    }
    // Invalid file type
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        code: "INVALID_FILE_TYPE",
        message: err.message || "Invalid file type",
      });
    }
  }

  // Other errors
  if (err) {
    return res.status(500).json({
      success: false,
      code: "UPLOAD_ERROR",
      message: err.message || "Failed to upload file",
    });
  }

  next();
};
