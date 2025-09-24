import express from "express";
import {
  addTestimonial,
  getApprovedTestimonials,
  approveTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

// Public
router.get("/", getApprovedTestimonials);
router.post("/", addTestimonial);

// Admin-only (future proof)
router.put("/:id/approve", approveTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
