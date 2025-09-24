// backend/routes/productRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  addProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import logger from "../config/logger.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🛡️ Rate Limiter
 * Limits requests to prevent abuse
 */
const productLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests for products. Please try again later.",
  },
  handler: (req, res, options) => {
    logger.warn(`⚠️ Product API rate limit exceeded by ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * 🛠️ Public Product Routes
 */
router.get("/", productLimiter, getProducts);
router.get("/:slug", productLimiter, getProductBySlug);

/**
 * 🛠️ Admin-only Product Routes
 * All routes protected by JWT + admin check
 */
router.post("/", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
