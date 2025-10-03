// Script to diagnose environment issues in Next.js / Render

console.log("=== ENV DIAGNOSTIC ===");

// 1️⃣ Node / Next.js ENV
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXT_PUBLIC_ENV:", process.env.NEXT_PUBLIC_ENV);
console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("REACT_APP_ENV:", process.env.REACT_APP_ENV);
console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);

// 2️⃣ Detect which env files exist
import fs from "fs";
import path from "path";

const envFiles = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
].map((f) => path.resolve(process.cwd(), f));

console.log("\nChecking for env files:");
envFiles.forEach((f) => {
  console.log(f, "exists:", fs.existsSync(f));
});

// 3️⃣ Optional: load each file and display values (careful with secrets!)
envFiles.forEach((f) => {
  if (fs.existsSync(f)) {
    console.log(`\nContents of ${f}:`);
    const lines = fs.readFileSync(f, "utf-8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#"));
    lines.forEach((l) => console.log(" ", l));
  }
});

console.log("\n✅ Done.");
