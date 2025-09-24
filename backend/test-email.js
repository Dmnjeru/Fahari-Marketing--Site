// backend/test-email.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Force dotenv to load from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

import sendEmail from "./utils/sendEmail.js";
import logger from "./config/logger.js";

(async () => {
  try {
    const info = await sendEmail({
      to: "njerudennis86@gmail.com", // <-- change to a real address
      subject: "✅ SMTP Test from Fahari Backend",
      text: "This is a production test email from Fahari backend.",
    });

    logger.info(`✅ Test email sent successfully: ${info?.messageId || "No Message ID"}`);
  } catch (err) {
    logger.error(`❌ Test email failed: ${err.message}`);
    process.exit(1);
  }
})();
