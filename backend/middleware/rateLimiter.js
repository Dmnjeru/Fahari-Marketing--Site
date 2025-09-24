import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * Standard messages for rate limits
 */
const messages = {
  public: { success: false, message: "Too many requests, try again later." },
  apply: { success: false, message: "Too many application attempts from this IP, slow down." },
  admin: { success: false, message: "Too many requests, slow down." },
};

/**
 * Rate limiters
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: messages.public,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: ipKeyGenerator, // ✅ Safe for IPv4 + IPv6
});

export const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: messages.apply,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: ipKeyGenerator, // ✅ Safe for IPv4 + IPv6
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120,
  message: messages.admin,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  keyGenerator: ipKeyGenerator, // ✅ Safe for IPv4 + IPv6
});
