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

import { uploadCvMiddleware, handleCvUploadErrors } from "../middleware/uploadCV.js";
import { publicLimiter, applyLimiter, adminLimiter } from "../middleware/rateLimiter.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import logger from "../config/logger.js";

const router = express.Router();

/* -------------------- Helper: Validation Runner -------------------- */
const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const trimmed = errors.array().map(({ msg, param }) => ({ msg, param }));
    logger.warn(`❌ Validation failed: ${JSON.stringify(trimmed)}`);
    return res.status(400).json({ success: false, errors: trimmed });
  }
  next();
};

/* -------------------- PUBLIC ROUTES -------------------- */

// List all jobs
router.get("/jobs", publicLimiter, expressAsyncHandler(getAllJobs));

// Get single job by ID
router.get(
  "/jobs/:id",
  publicLimiter,
  param("id").isMongoId().withMessage("Invalid job ID"),
  runValidation,
  expressAsyncHandler(getJobById)
);

/* -------------------- CANDIDATE APPLY -------------------- */
const applyValidation = [
  body("jobId").notEmpty().withMessage("jobId required").isMongoId().withMessage("Invalid jobId"),
  body("fullName").trim().notEmpty().withMessage("Full name required").isLength({ min: 2, max: 200 }),
  body("email").trim().notEmpty().withMessage("Email required").isEmail().withMessage("Invalid email"),
  body("phone").optional().isString(),
  body("coverLetter").optional().isLength({ max: 3000 }),
  body("customAnswers").optional().custom((val) => {
    if (!val) return true;
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) throw new Error("customAnswers must be an array");
      } catch {
        throw new Error("customAnswers must be valid JSON array");
      }
    } else if (!Array.isArray(val)) {
      throw new Error("customAnswers must be an array");
    }
    return true;
  }),
];

// Candidate applies for a job
router.post(
  "/apply",
  applyLimiter,
  uploadCvMiddleware,   // multer handles single file
  handleCvUploadErrors, // catch multer errors
  applyValidation,
  runValidation,
  expressAsyncHandler(applyForJob) // controller handles R2 upload + email
);

/* -------------------- ADMIN JOB MANAGEMENT -------------------- */
const jobValidation = [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("slug").trim().notEmpty().withMessage("Slug required"),
  body("location").trim().notEmpty().withMessage("Location required"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type required")
    .isIn(["Full-time", "Part-time", "Contract", "Internship", "Temporary"]),
  body("description").trim().notEmpty().withMessage("Description required").isLength({ min: 20 }),
  body("requirements").optional().isArray(),
];

// Create a job
router.post(
  "/jobs",
  adminLimiter,
  protect,
  adminOnly,
  jobValidation,
  runValidation,
  expressAsyncHandler(createJob)
);

// Update job
router.patch(
  "/jobs/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid job id"),
  runValidation,
  expressAsyncHandler(updateJob)
);

// Delete job
router.delete(
  "/jobs/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid job id"),
  runValidation,
  expressAsyncHandler(deleteJob)
);

/* -------------------- ADMIN APPLICATIONS -------------------- */
router.get("/applications", adminLimiter, protect, adminOnly, expressAsyncHandler(getAllApplications));

router.get("/applications/count", adminLimiter, protect, adminOnly, expressAsyncHandler(applicationsCount));

router.get(
  "/applications/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application id"),
  runValidation,
  expressAsyncHandler(getApplication)
);

router.patch(
  "/applications/:id/status",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application id"),
  body("status").optional().isIn(["pending", "reviewed", "shortlisted", "rejected", "accepted"]),
  body("notes").optional().isString(),
  body("notifyCandidate").optional().isBoolean(),
  runValidation,
  expressAsyncHandler(updateApplicationStatus)
);

router.delete(
  "/applications/:id",
  adminLimiter,
  protect,
  adminOnly,
  param("id").isMongoId().withMessage("Invalid application id"),
  runValidation,
  expressAsyncHandler(deleteApplication)
);

/* -------------------- FALLBACK -------------------- */
router.use((req, res) => {
  res.status(404).json({ success: false, message: "Careers endpoint not found" });
});

export default router;
