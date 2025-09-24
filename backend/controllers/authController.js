// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import logger from "../config/logger.js";

/**
 * Auth controller
 * - login(req, res)
 * - refresh(req, res)
 * - getMe(req, res)          (expects protect middleware to set req.user)
 * - logout(req, res)
 *
 * This file reads secrets at runtime from env to avoid import-time surprises.
 */

/* ---------------------- Helpers: env & token utilities ---------------------- */

function getAccessSecret() {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_SECRET || "";
  if (!secret) {
    logger.error("JWT access secret is not configured. Set JWT_SECRET or ACCESS_SECRET.");
    throw new Error("JWT access secret is required");
  }
  return secret;
}

function getRefreshSecret() {
  // allow separate refresh secret but fallback to JWT_SECRET
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "";
  if (!secret) {
    logger.error("JWT refresh secret is not configured. Set REFRESH_TOKEN_SECRET or JWT_SECRET.");
    throw new Error("JWT refresh secret is required");
  }
  return secret;
}

function getAccessExpiry() {
  return process.env.ACCESS_TOKEN_EXPIRES || process.env.JWT_EXPIRES_IN || "15m";
}

function getRefreshExpiry() {
  return process.env.REFRESH_TOKEN_EXPIRES || "7d";
}

function getRefreshCookieName() {
  return process.env.REFRESH_COOKIE_NAME || "refreshToken";
}

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

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: !!isProd,
    // For cross-site use in production (frontend on different origin), SameSite=None is required.
    // In dev (localhost) SameSite=lax avoids cookie issues without HTTPS.
    sameSite: isProd ? "none" : "lax",
    maxAge: msFromExpiry(getRefreshExpiry()),
    path: "/", // cookie available site-wide
  };
}

function signAccessToken(payload) {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: getAccessExpiry() });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, getRefreshSecret(), { expiresIn: getRefreshExpiry() });
}

/* ---------------------- Controller actions ---------------------- */

/**
 * POST /api/admin/login
 * - body: { email, password }
 * - returns: { success: true, token: <accessToken>, user: { id, name, email, role } }
 * - sets HttpOnly refresh cookie
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password +refreshToken");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: admin only" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

    // Persist refresh token (enables rotation / logout)
    user.refreshToken = refreshToken;
    await user.save();

    // Set HttpOnly refresh cookie
    res.cookie(getRefreshCookieName(), refreshToken, cookieOptions());

    return res.status(200).json({
      success: true,
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    logger.error(`AuthController.login error: ${err?.message ?? String(err)}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/admin/refresh
 * - reads refresh token from cookie or request body
 * - verifies and rotates refresh token
 * - sets new refresh cookie and returns new access token
 */
export async function refresh(req, res) {
  try {
    const cookieName = getRefreshCookieName();
    const token = req.cookies?.[cookieName] || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    let payload;
    try {
      payload = jwt.verify(token, getRefreshSecret());
    } catch (err) {
      // invalid or expired refresh token
      res.clearCookie(cookieName, { path: "/" });
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

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
      // rotated or revoked
      user.refreshToken = undefined;
      await user.save();
      res.clearCookie(cookieName, { path: "/" });
      return res.status(401).json({ success: false, message: "Refresh token invalidated" });
    }

    // rotate tokens
    const newAccessToken = signAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save();

    // set rotated cookie
    res.cookie(cookieName, newRefreshToken, cookieOptions());

    return res.status(200).json({ success: true, token: newAccessToken });
  } catch (err) {
    logger.error(`AuthController.refresh error: ${err?.message ?? String(err)}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/admin/me
 * - requires protect middleware to set req.user
 * - returns safe user info
 */
export async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    const { _id, name, email, role } = user;
    return res.status(200).json({ success: true, user: { id: _id, name, email, role } });
  } catch (err) {
    logger.error(`AuthController.getMe error: ${err?.message ?? String(err)}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * POST /api/admin/logout
 * - clears server-side stored refresh token and clears cookie
 * - protected by `protect` middleware (so only authenticated users can log themselves out)
 */
export async function logout(req, res) {
  try {
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
  } catch (err) {
    logger.error(`AuthController.logout error: ${err?.message ?? String(err)}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
