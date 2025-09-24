//backend\routes\blogRoutes.js
import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================
// Public routes
// ============================
router.get("/", getBlogs);
router.get("/:slug", getBlogBySlug);

// ============================
// Admin routes (protected)
// ============================
router.post("/", protect, adminOnly, createBlog);
router.put("/:id", protect, adminOnly, updateBlog);
router.delete("/:id", protect, adminOnly, deleteBlog);

export default router;
