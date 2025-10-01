// backend/routes/blogRoutes.js
import express from "express";
import multer from "multer";

import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  generateWithAI as generateBlogAI, // alias from controller
  uploadMedia,
} from "../controllers/blogController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------
   Public Routes
   ---------------------------- */

// Get all blogs (supports filters, pagination, search)
router.get("/", getBlogs);

// Get single blog by slug
router.get("/:slug", getBlogBySlug);

/* ----------------------------
   Admin Routes (Protected)
   ---------------------------- */
router.use(protect, adminOnly);

// Create a new blog
router.post("/", createBlog);

// Update an existing blog
router.put("/:id", updateBlog);

// Delete a blog
router.delete("/:id", deleteBlog);

/* ----------------------------
   Media Uploads (images / files)
   ---------------------------- */

// Multer config (memory storage -> R2/S3 upload handled in controller)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// Single file upload
router.post("/upload", upload.single("file"), uploadMedia);

// Multiple file upload (max 5 files)
router.post("/upload/multiple", upload.array("files", 5), uploadMedia);

/* ----------------------------
   AI-Powered Blog Generation
   ---------------------------- */
// Accepts { title?, keywords?, category?, prompt } in body
// Returns generated content
router.post("/generate", generateBlogAI);

/* ----------------------------
   Optional: SEO/UX Enhancements
   ---------------------------- */
// Get featured blogs (for homepage sections)
router.get("/featured", async (req, res) => {
  try {
    const Blog = (await import("../models/Blog.js")).default;
    const featured = await Blog.find({ isPublished: true, isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, data: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get trending blogs (by views)
router.get("/trending", async (req, res) => {
  try {
    const Blog = (await import("../models/Blog.js")).default;
    const trending = await Blog.find({ isPublished: true })
      .sort({ views: -1 })
      .limit(5);
    res.json({ success: true, data: trending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
