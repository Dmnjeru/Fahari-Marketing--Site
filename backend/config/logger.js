// backend/config/logger.js
import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const env = process.env.NODE_ENV || "development";
const logDir = path.resolve(process.cwd(), "logs");

// ensure log directory exists
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    // fallback: continue without file logging
    // eslint-disable-next-line no-console
    console.warn("Could not create logs directory:", err?.message ?? err);
  }
}

// file formatter: JSON with timestamp & stack
const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// console formatter: human readable
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

const logger = createLogger({
  level: env === "development" ? "debug" : "info",
  // default to file transports; console is added in dev below
  transports: [
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: fileFormat,
      handleExceptions: true,
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

// In development, log to console too
if (env === "development") {
  logger.add(
    new transports.Console({
      format: consoleFormat,
      handleExceptions: true,
    })
  );
}

// Handle uncaught exceptions & rejections gracefully
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason instanceof Error ? reason.stack : String(reason));
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err instanceof Error ? err.stack : String(err));
  // Give logger time to flush
  setTimeout(() => process.exit(1), 200);
});

export default logger;
