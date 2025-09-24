// backend/routes/adminRoutes.js
import express from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

import User from "../models/User.js";
import logger from "../config/logger.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Runtime helpers (read env at runtime to avoid import-time issues)
 */
function getAccessSecret() {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_SECRET || "";
  if (!secret) {
    logger.error("JWT access secret is not configured. Set JWT_SECRET or ACCESS_SECRET.");
    throw new Error("JWT access secret is required");
  }
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "";
  if (!secret) {
    logger.error("JWT refresh secret is not configured. Set REFRESH_TOKEN_SECRET or JWT_SECRET.");
    throw new Error("JWT refresh secret is required");
  }
  return secret;
}

function getAccessExpiry() {
  // format examples: "15m", "1h"
  return process.env.ACCESS_TOKEN_EXPIRES || process.env.JWT_EXPIRES_IN || "15m";
}

function getRefreshExpiry() {
  return process.env.REFRESH_TOKEN_EXPIRES || "7d";
}

function getRefreshCookieName() {
  return process.env.REFRESH_COOKIE_NAME || "refreshToken";
}

/**
 * Convert expiry like "7d", "15m" to ms for cookie maxAge
 */
function msFromExpiry(exp) {
  if (!exp || typeof exp !== "string") return 7 * 24 * 60 * 60 * 1000;
  const num = Number(exp.slice(0, -1));
  const unit = exp.slice(-1).toLowerCase();
  if (Number.isNaN(num)) return 7 * 24 * 60 * 60 * 1000;
  switch (unit) {
    case "d":
      return num * 24 * 60 * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "m":
      return num * 60 * 1000;
    case "s":
      return num * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Cookie options for the refresh token.
 * - In production we set secure: true and SameSite=None so cross-site requests work over HTTPS.
 * - In development, secure is false and sameSite is "lax" so cookies work on localhost without HTTPS.
 */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: !!isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: msFromExpiry(getRefreshExpiry()),
    path: "/", // available site-wide
    // Note: do NOT set `domain` unless you understand your hosting setup
  };
}

/**
 * Sign tokens
 */
function signAccessToken(payload) {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: getAccessExpiry() });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: getRefreshExpiry() });
}

/* -----------------------
   Routes mounted under /api/admin
   - POST   /login
   - POST   /refresh
   - GET    /me
   - POST   /logout
   ----------------------- */

/* -----------------------
   POST /api/admin/login
   - Validates credentials
   - Only allows users with role "admin"
   - Issues access token (in response body) and refresh token (HttpOnly cookie)
   ----------------------- */
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Only admin allowed
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: admin only" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Signed tokens
    const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

    // Persist refresh token for rotation / logout
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token cookie (HttpOnly)
    res.cookie(getRefreshCookieName(), refreshToken, cookieOptions());

    // Return access token and safe user info
    return res.status(200).json({
      success: true,
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  })
);

/* -----------------------
   POST /api/admin/refresh
   - Reads refresh token from cookie (or body fallback)
   - Verifies token, checks DB-stored refreshToken, rotates refresh token
   - Returns new access token (and sets rotated refresh cookie)
   ----------------------- */
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const cookieName = getRefreshCookieName();
    const token = req.cookies?.[cookieName] || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    let payload;
    try {
      payload = jwt.verify(token, getRefreshSecret());
    } catch (err) {
      // invalid or expired refresh token — clear cookie
      res.clearCookie(cookieName, { path: "/" });
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    // Ensure user exists and token matches stored value
    const user = await User.findById(payload.id).select("+refreshToken +role");
    if (!user) {
      res.clearCookie(cookieName, { path: "/" });
      return res.status(401).json({ success: false, message: "Invalid token user" });
    }

    if (user.role !== "admin") {
      res.clearCookie(cookieName, { path: "/" });
      return res.status(403).json({ success: false, message: "Invalid token user" });
    }

    if (!user.refreshToken || user.refreshToken !== token) {
      // Token was revoked or rotated elsewhere
      user.refreshToken = undefined;
      await user.save();
      res.clearCookie(cookieName, { path: "/" });
      return res.status(401).json({ success: false, message: "Refresh token invalidated" });
    }

    // Rotate tokens
    const newAccessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh cookie
    res.cookie(cookieName, newRefreshToken, cookieOptions());

    return res.status(200).json({ success: true, token: newAccessToken });
  })
);

/* -----------------------
   GET /api/admin/me
   - protected by `protect` (valid access token required) and `adminOnly`
   - returns current admin user (safe fields only)
   ----------------------- */
router.get(
  "/me",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { _id, name, email, role } = user;
    return res.status(200).json({ success: true, user: { id: _id, name, email, role } });
  })
);

/* -----------------------
   POST /api/admin/logout
   - protected: user must present a valid access token
   - clears refresh token server-side and clears cookie client-side
   ----------------------- */
router.post(
  "/logout",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const cookieName = getRefreshCookieName();
    const token = req.cookies?.[cookieName] || req.body?.refreshToken;

    if (token) {
      try {
        const payload = jwt.verify(token, getRefreshSecret());
        const user = await User.findById(payload.id).select("+refreshToken +role");
        if (user && user.role === "admin" && user.refreshToken === token) {
          user.refreshToken = undefined;
          await user.save();
        }
      } catch (err) {
        // ignore verification errors here — we'll clear cookie anyway
      }
    }

    res.clearCookie(cookieName, { path: "/" });
    return res.status(200).json({ success: true, message: "Logged out" });
  })
);

export default router;
