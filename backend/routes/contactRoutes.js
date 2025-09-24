// backend/routes/contactRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import { submitContactForm } from "../controllers/contactController.js";
import logger from "../config/logger.js";

const router = express.Router();

/**
 * 🛡️ Rate Limiter
 * - Prevents spam by limiting how many times the same IP can send messages.
 * - Here, we allow 5 requests per 15 minutes per IP.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many contact requests. Please try again later.",
  },
  handler: (req, res, next, options) => {
    logger.warn(`⚠️ Contact form rate limit exceeded by ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * ✅ Input Validation
 * - Ensures the submitted data is clean and safe.
 */
const validateContactForm = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters long"),
];

/**
 * 🛠️ POST /api/contact
 * - Accepts contact form data from the frontend.
 * - Validates and sanitizes input.
 * - Uses the controller to send an email + store logs.
 */
router.post("/", contactLimiter, validateContactForm, submitContactForm);

export default router;
// backend/utils/sendEmail.js