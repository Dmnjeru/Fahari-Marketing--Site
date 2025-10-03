// backend/server.js
// ================================
// FAHARI YOGHURT MARKETING SITE
// Production-ready server entry (ES module)
// ================================

import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import fs from "fs";
import dotenv from "dotenv";


// -------------------------------
// Compute __filename / __dirname
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// -------------------------------
// Load .env early (robust)
// -------------------------------
function loadDotenv() {
  const explicit = process.env.DOTENV_PATH;
  const candidates = explicit
    ? [resolve(explicit)]
    : [
        resolve(process.cwd(), ".env"),
        resolve(process.cwd(), "backend/.env"),
        resolve(__dirname, ".env"),
      ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
        console.info(`✅ Loaded environment from ${p}`);
        return p;
      }
    } catch {}
  }

  dotenv.config();
  console.warn(
    "⚠️ No explicit .env file found in candidates — loaded default env (if any)."
  );
  return null;
}

loadDotenv();

// -------------------------------
// Dynamically import core libs
// (ensures modules see process.env when imported)
// -------------------------------
const [
  { default: cookieParser },
  { default: express },
  { default: cors },
  { default: helmet },
  { default: compression },
  { default: morgan },
  { createServer },
] = await Promise.all([
  import("cookie-parser"),
  import("express"),
  import("cors"),
  import("helmet"),
  import("compression"),
  import("morgan"),
  import("http").then((mod) => ({ createServer: mod.createServer })),
]);

// -------------------------------
// App-specific modules (dynamic)
// -------------------------------
const connectDBModule = await import("./config/db.js");
const loggerModule = await import("./config/logger.js");
const socketManagerModule = await import("./utils/socketManager.js");

// route modules
const contactRoutesModule = await import("./routes/contactRoutes.js");
const productRoutesModule = await import("./routes/productRoutes.js");
const promoRoutesModule = await import("./routes/promoRoutes.js");
const retailerRoutesModule = await import("./routes/retailerRoutes.js");
const careersRoutesModule = await import("./routes/careersRoutes.js");
const analyticsRoutesModule = await import("./routes/analyticsRoutes.js");
const adminRoutesModule = await import("./routes/adminRoutes.js");
const blogRoutesModule = await import("./routes/blogRoutes.js");

// utils
const mailerModule = await import("./utils/mailer.js");
const r2UploaderModule = await import("./utils/r2Uploader.js");
const sendEmailModule = await import("./utils/sendEmail.js").catch(() => null);

// -------------------------------
// Unwrap exports (be defensive)
// -------------------------------
const connectDB = connectDBModule.default ?? connectDBModule.connectDB ?? connectDBModule;
const logger = loggerModule.default ?? loggerModule;
const initSocketServer = socketManagerModule.initSocketServer ?? socketManagerModule.default?.initSocketServer;

// routes
const contactRoutes = contactRoutesModule.default ?? contactRoutesModule;
const productRoutes = productRoutesModule.default ?? productRoutesModule;
const promoRoutes = promoRoutesModule.default ?? promoRoutesModule;
const retailerRoutes = retailerRoutesModule.default ?? retailerRoutesModule;
const careersRoutes = careersRoutesModule.default ?? careersRoutesModule;
const analyticsRoutes = analyticsRoutesModule.default ?? analyticsRoutesModule;
const adminRoutes = adminRoutesModule.default ?? adminRoutesModule;
const blogRoutes = blogRoutesModule.default ?? blogRoutesModule;

// mailer
const mailer = mailerModule?.default ?? mailerModule;
const initMailer = typeof mailer?.initMailer === "function" ? mailer.initMailer : null;
const sendEmail =
  (typeof mailer?.sendEmail === "function" && mailer.sendEmail) ||
  (typeof mailer?.send === "function" && mailer.send) ||
  (sendEmailModule ? (sendEmailModule.default ?? sendEmailModule.sendEmail ?? sendEmailModule) : null);

// R2 uploader
const initR2Uploader = r2UploaderModule?.initR2Uploader ?? r2UploaderModule?.default?.initR2Uploader ?? null;

// -------------------------------
// App bootstrap
// -------------------------------
const app = express();
const server = createServer(app);

// Connect to DB
try {
  if (typeof connectDB === "function") {
    await connectDB();
    logger.info("✅ MongoDB connected (connectDB executed).");
  } else {
    logger.warn("⚠️ connectDB is not a function - skipping DB connect.");
  }
} catch (err) {
  logger.error("❌ Failed to connect to DB:", err);
}

// Initialize mailer
try {
  if (typeof initMailer === "function") {
    const t = await initMailer();
    if (t) logger.info("✅ Mailer initialized");
    else logger.warn("⚠️ Mailer init returned null (SMTP may be unconfigured).");
  } else logger.warn("⚠️ initMailer not available - skipping mailer init.");
} catch (err) {
  logger.error("❌ Mailer init failed:", err?.message ?? err);
}

// Initialize Cloudflare R2
try {
  if (typeof initR2Uploader === "function") {
    const ok = initR2Uploader();
    if (ok) logger.info("✅ Cloudflare R2 uploader initialized");
    else logger.warn("⚠️ R2 uploader not initialized. Uploads may fail.");
  } else logger.warn("⚠️ initR2Uploader not available - skipping R2 init.");
} catch (err) {
  logger.error("❌ R2 uploader init failed:", err?.message ?? err);
}

// -------------------------------
// Middleware
// -------------------------------
const trustProxyEnv = process.env.TRUST_PROXY ?? "loopback";
app.set("trust proxy", trustProxyEnv);
logger.info(`⚙️ trust proxy set to: ${trustProxyEnv}`);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const allowedOrigins = [
  process.env.FRONTEND_URL ?? "https://faharidairies.co.ke",
  "https://www.faharidairies.co.ke",
  "https://fahariyoghurt.co.ke",
  "https://www.fahariyoghurt.co.ke",
  "https://api.faharidairies.co.ke",   // <--- ADD
  "https://api.fahariyoghurt.co.ke",   // <--- ADD
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];


const allowedHeaders = [
  "Content-Type",
  "Authorization",
  "Accept",
  "Origin",
  "X-Requested-With",
  "x-admin-key",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`🚫 CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "));
    res.setHeader("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.static(join(__dirname, "public")));

// -------------------------------
// Routes
// -------------------------------
app.use("/api/contact", contactRoutes);
app.use("/api/products", productRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/careers", careersRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);

// Health check
app.get("/api/health", (req, res) =>
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date(),
  })
);

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
