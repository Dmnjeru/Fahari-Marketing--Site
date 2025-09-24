import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import r2 from "../utils/r2.js"; // make sure the path is correct

async function testUpload() {
  try {
    const filePath = path.resolve("./test-file.txt");
    fs.writeFileSync(filePath, "Hello Fahari R2 Test!"); // create a temporary file

    const key = `test/${Date.now()}-test-file.txt`;
    const url = await r2.uploadFileToR2(fs.readFileSync(filePath), key, "text/plain");

    console.log("✅ Upload succeeded!");
    console.log("Public URL:", url);

    fs.unlinkSync(filePath); // cleanup temp file
  } catch (err) {
    console.error("❌ Upload failed:", err);
  }
}

testUpload();
