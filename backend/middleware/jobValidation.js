// backend/middleware/jobValidation.js
import { body } from "express-validator";

export const validateJob = [
  // Title
  body("title")
    .notEmpty()
    .withMessage("Job title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  // Description
  body("description")
    .notEmpty()
    .withMessage("Job description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),

  // Location
  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),

  // Type (role type)
  body("type")
    .notEmpty()
    .withMessage("Job type is required")
    .isIn(["Full-time", "Part-time", "Contract", "Internship", "Remote"])
    .withMessage("Invalid job type"),

  // Deadline
  body("deadline")
    .notEmpty()
    .withMessage("Application deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date")
    .custom((value) => {
      const today = new Date();
      const deadlineDate = new Date(value);
      if (deadlineDate < today) {
        throw new Error("Deadline cannot be in the past");
      }
      return true;
    }),

  // Requirements (optional but must be valid if provided)
  body("requirements")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Requirements must be an array")
    .custom((arr) => {
      if (arr.some((req) => typeof req !== "string" || req.trim().length < 3)) {
        throw new Error("Each requirement must be a string of at least 3 characters");
      }
      return true;
    }),

  // Custom questions (optional but must be valid if provided)
  body("customQuestions")
    .optional()
    .isArray()
    .withMessage("Custom questions must be an array")
    .custom((questions) => {
      questions.forEach((q) => {
        if (!q.question || q.question.trim().length < 5) {
          throw new Error("Each custom question must have at least 5 characters");
        }
        if (!["text", "textarea", "select", "file"].includes(q.type)) {
          throw new Error("Invalid custom question type");
        }
      });
      return true;
    }),

  // Status (for updates)
  body("status")
    .optional()
    .isIn(["active", "closed"])
    .withMessage("Status must be either 'active' or 'closed'"),

  // Status reason (required if closing job)
  body("statusReason")
    .optional()
    .custom((value, { req }) => {
      if (req.body.status === "closed" && (!value || value.trim().length < 5)) {
        throw new Error("Status reason is required when closing a job");
      }
      return true;
    }),
];
