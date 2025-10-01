// backend/routes/careersRoutes.js
import express from "express";
import { body, param, validationResult } from "express-validator";
import expressAsyncHandler from "express-async-handler";

import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getAllApplications,
  getApplication,
  applicationsCount,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/careersController.js";

import {
  uploadCvMiddleware,
  uploadCvToR2,
  handleCvUploadErrors,
} from "../middleware/uploadCV.js";
import { publicLimiter, applyLimiter, adminLimiter } from "../middleware/rateLimiter.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import logger from "../config/logger.js";

const router = express.Router();

/* -------------------- Middleware -------------------- */

// Validation runner middleware
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const trimmed = errors.array().map(({ msg, param }) => ({ msg, param }));
    logger.warn(`❌ Validation failed for ${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      errors: trimmed,
    });
    return res.status(400).json({ success: false, errors: trimmed });
  }
  next();
};

/* -------------------- PUBLIC ROUTES -------------------- */

// GET /jobs - List all jobs (paginated)
router.get("/jobs", publicLimiter, expressAsyncHandler(getAllJobs));

// GET /jobs/:id - Get single job by ID
router.get(
  "/jobs/:id",
  publicLimiter,
  param("id").isMongoId().withMessage("Invalid job ID"),
  runValidation,
  expressAsyncHandler(getJobById)
);

/* -------------------- CANDIDATE APPLY -------------------- */

const applyValidation = [
  body("jobId")
    .notEmpty().withMessage("jobId is required")
    .isMongoId().withMessage("Invalid jobId"),
  body("fullName")
    .trim()
    .notEmpty().withMessage("Full name is required")
    .isLength({ min: 2, max: 200 }).withMessage("Full name must be between 2 and 200 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
  body("phone").optional().trim().isString(),
  body("coverLetter").optional().trim().isLength({ max: 3000 }).withMessage("Cover letter too long"),
  body("customAnswers").optional().custom((val) => {
    if (!val) return true;
    let answers = val;
    if (typeof val === "string") {
      try {
        answers = JSON.parse(val);
      } catch {
        throw new Error("customAnswers must be valid JSON array");
      }
    }
    if (!Array.isArray(answers)) throw new Error("customAnswers must be an array");
    return true;
  }),
];

// POST /apply - Candidate applies for a job
router.post(
  "/apply",
  applyLimiter,
  uploadCvMiddleware,
  handleCvUploadErrors,
  uploadCvToR2,        // <-- Upload CV to R2 here
  applyValidation,
  runValidation,
  expressAsyncHandler(applyForJob)
);

/* -------------------- ADMIN JOB MANAGEMENT -------------------- */

const jobValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("slug").trim().notEmpty().withMessage("Slug is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("type")
    .trim()
    .notEmpty().withMessage("Type is required")
    .isIn(["Full-time", "Part-time", "Contract", "Internship", "Temporary"])
    .withMessage("Invalid job type"),
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),
  body("requirements").optional().custom((val) => {
    if (!val) return true;
    if (!Array.isArray(val)) throw new Error("Requirements must be an array");
    return true;
  }),
];

// POST /jobs - Create job
router.post(
  "/jobs",
  adminLimiter,
  protect,
  adminOnly,
  jobValidation,
  runValidation,
  expressAsyncHandler(createJob)
);

// PATCH /jobs/:id - Update job
router.patch(
  "/jobs/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid job ID"),
  jobValidation,
  runValidation,
  expressAsyncHandler(updateJob)
);

// DELETE /jobs/:id - Delete job
router.delete(
  "/jobs/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid job ID"),
  runValidation,
  expressAsyncHandler(deleteJob)
);

/* -------------------- ADMIN APPLICATIONS -------------------- */

// GET /applications - List all applications
router.get("/applications", adminLimiter, protect, adminOnly, expressAsyncHandler(getAllApplications));

// GET /applications/count - Count of applications
router.get("/applications/count", adminLimiter, protect, adminOnly, expressAsyncHandler(applicationsCount));

// GET /applications/:id - Single application
router.get(
  "/applications/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application ID"),
  runValidation,
  expressAsyncHandler(getApplication)
);

// PATCH /applications/:id/status - Update application status
router.patch(
  "/applications/:id/status",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("status")
    .optional()
    .isIn(["pending", "reviewed", "shortlisted", "rejected", "accepted"])
    .withMessage("Invalid status value"),
  body("notes").optional().trim().isString(),
  body("notifyCandidate").optional().isBoolean(),
  runValidation,
  expressAsyncHandler(updateApplicationStatus)
);

// DELETE /applications/:id - Delete application
router.delete(
  "/applications/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application ID"),
  runValidation,
  expressAsyncHandler(deleteApplication)
);

/* -------------------- FALLBACK -------------------- */
router.use((req, res) => {
  logger.warn(`❌ Unknown careers route accessed: ${req.method} ${req.originalUrl}`, { ip: req.ip });
  res.status(404).json({ success: false, message: "Careers endpoint not found" });
});

export default router;
