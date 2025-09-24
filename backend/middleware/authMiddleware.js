// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../config/logger.js";

/**
 * Read access token secret from env
 */
function getAccessSecret() {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_SECRET;
  if (!secret) {
    logger.error("JWT access secret is not configured");
    throw new Error("JWT access secret is required");
  }
  return secret;
}

/**
 * Protect routes: verify JWT access token
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ success: false, message: "Not authorized" });

    let decoded;
    try {
      decoded = jwt.verify(token, getAccessSecret());
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token invalid or expired" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user; // attach for later use
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err?.message ?? String(err)}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Admin-only guard middleware
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access only" });
  }

  next();
};
