// backend/routes/promoRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  addPromo,
  getPromos,
  getPromoBySlug,
  updatePromo,
  deletePromo,
} from "../controllers/promoController.js";
import logger from "../config/logger.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🛡️ Rate Limiter for Promo API
 * Limits requests to prevent abuse
 */
const promoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 80,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again later.",
  },
  handler: (req, res, options) => {
    logger.warn(`⚠️ Promo API rate limit exceeded by ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * 🌍 Public Routes (Marketing Site)
 */
router.get("/", promoLimiter, getPromos);
router.get("/:slug", promoLimiter, getPromoBySlug);

/**
 * 🔒 Admin-only Routes (Protected)
 */
router.post("/", protect, adminOnly, addPromo);
router.put("/:id", protect, adminOnly, updatePromo);
router.delete("/:id", protect, adminOnly, deletePromo);

export default router;
