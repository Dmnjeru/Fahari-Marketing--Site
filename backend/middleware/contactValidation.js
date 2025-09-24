//backend\middleware\contactValidation.js
import { body } from "express-validator";

export const validateContactForm = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters long"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("phone")
    .optional()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage("Invalid phone number"),
  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Message must be between 10 and 500 characters"),
];
