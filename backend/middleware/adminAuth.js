// backend/middleware/adminAuth.js
import logger from "../config/logger.js";

/**
 * Admin-only middleware
 * Assumes req.user is already set by `protect`
 */
export const admin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
    }

    next();
  } catch (err) {
    logger.error(`Admin middleware error: ${err?.message ?? String(err)}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
