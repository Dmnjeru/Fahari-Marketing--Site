// backend/routes/analyticsRoutes.js
import express from "express";
import expressAsyncHandler from "express-async-handler";

import {
  getDashboardOverview,
  getTopProducts,
  getTopBlogs,
  getRevenueStats,
} from "../controllers/analyticsController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* -------------------- Admin Analytics Routes -------------------- */

// Dashboard overview stats
router.get("/overview", protect, adminOnly, expressAsyncHandler(getDashboardOverview));

// Top-selling products
router.get("/top-products", protect, adminOnly, expressAsyncHandler(getTopProducts));

// Top-viewed blogs
router.get("/top-blogs", protect, adminOnly, expressAsyncHandler(getTopBlogs));

// Revenue stats by range
router.get("/stats", protect, adminOnly, expressAsyncHandler(getRevenueStats));

export default router;
