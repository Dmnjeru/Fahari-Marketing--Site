// backend/server.js
// ================================
// FAHARI YOGHURT MARKETING SITE
// Production-ready server entry (ES module)
// ================================

import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import fs from "fs";
import dotenv from "dotenv";
import smtpTestRoute from "./smtp-test.js";

// -------------------------------
// ... after app setup
app.use("/api", smtpTestRoute);

// Newsletter
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    if (typeof sendEmail === "function") {
      await sendEmail({
        to: email,
        subject: "Welcome to Fahari Yoghurt Newsletter 🎉",
        html: `<h2>Karibu to Fahari Yoghurt & Dairies!</h2><p>Thanks for subscribing.</p>`,
      });
    } else {
      logger.warn("sendEmail not available - logging only");
      logger.info(`[LOG-ONLY] Newsletter subscription: ${email}`);
    }

    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    logger.error("❌ Newsletter error:", err?.message ?? err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// -------------------------------
// Realtime (Socket.IO)
try {
  if (typeof initSocketServer === "function") {
    initSocketServer(server);
    logger.info("⚡ Real-time Socket.IO server initialized");
  } else logger.warn("⚠️ initSocketServer not available; skipping socket init.");
} catch (err) {
  logger.error("❌ initSocketServer failed:", err);
}

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Resource not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err?.message?.startsWith("🚫 CORS blocked")) {
    logger.warn(err.message);
    return res.status(403).json({ success: false, message: err.message });
  }

  logger.error(err?.stack ?? String(err));
  const status = err?.status || 500;
  const message = err?.message || "Something went wrong";
  res.status(status).json({ success: false, message });
});

// -------------------------------
// Start & graceful shutdown
// -------------------------------
const PORT = Number(process.env.PORT || 5000);
const serverInstance = server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

function shutdown(signal) {
  return async () => {
    try {
      logger.info(`⚠️ Received ${signal}. Shutting down gracefully...`);
      serverInstance.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
      setTimeout(() => {
        logger.error("Forcing shutdown after timeout.");
        process.exit(1);
      }, 10000).unref();
    } catch (err) {
      logger.error("Error during shutdown:", err);
      process.exit(1);
    }
  };
}

process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});

export default app;
