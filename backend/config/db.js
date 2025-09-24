// backend/config/db.js
import mongoose from "mongoose";

/**
 * connectDB - Handles connection to MongoDB
 * Works for both development and production environments.
 */
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is missing in your .env file");
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Fail quickly if DB is unreachable
    });

    console.log(
      `✅ MongoDB Connected → ${conn.connection.host} / ${conn.connection.name}`
    );

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed due to app termination");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed due to app shutdown");
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("🔄 Retrying in 5 seconds...");
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

export default connectDB;
