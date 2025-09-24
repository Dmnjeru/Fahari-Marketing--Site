import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import User from "../models/User.js"; // Adjust path if needed

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompt helper
 */
const ask = (question) =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer)));

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const email = (await ask("Enter admin email: ")).trim();
    const name = (await ask("Enter admin name: ")).trim();
    const password = (await ask("Enter password: ")).trim();

    if (!email || !name || !password) {
      console.log("❌ All fields are required");
      process.exit(1);
    }

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("❌ Admin with this email already exists");
      process.exit(1);
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log(`✅ Admin user created: ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createAdmin();
