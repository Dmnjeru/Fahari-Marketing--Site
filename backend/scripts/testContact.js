// backend/scripts/testContact.js
import express from "express";
import request from "supertest";
import dotenv from "dotenv";
import mongoose from "mongoose";
import contactRoutes from "../routes/contactRoutes.js";
import logger from "../config/logger.js";

dotenv.config();

async function runTest() {
  console.log("🔄 Starting Contact Form Test...");

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  const app = express();
  app.use(express.json());
  app.use("/api/contact", contactRoutes);

  // Fake payload simulating frontend
  const payload = {
    name: "Test User",
    email: "njerudennis86@gmail.com",
    phone: "+254700123456",
    message: "Hello! This is a test contact form message..",
    type: "contact",
  };

  try {
    const res = await request(app).post("/api/contact").send(payload);

    console.log("📥 API Response:");
    console.log(res.status, res.body);
  } catch (err) {
    logger.error("🔥 Test script crashed", { err: err.message });
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

runTest();
