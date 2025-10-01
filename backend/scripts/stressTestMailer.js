// backend/scripts/stressTestMailer.js
import dotenv from "dotenv";
import mailer from "../utils/mailer.js";

dotenv.config();

async function runStressTest() {
  console.log("🔄 Starting Mailer Stress Test...");

  const TEST_EMAIL = process.env.TEST_EMAIL || "njerudennis86@gmail.com";

  // Create 20 test jobs
  const jobs = Array.from({ length: 20 }, (_, i) => ({
    to: TEST_EMAIL,
    subject: `📧 Stress Test Email #${i + 1}`,
    text: `This is stress test email #${i + 1} from Fahari Yoghurt mailer system.`,
    html: `<p>This is <b>stress test email #${i + 1}</b> from Fahari Yoghurt mailer system.</p>`,
  }));

  const promises = jobs.map((options, i) =>
    mailer
      .sendEmail(options)
      .then((info) => {
        console.log(`✅ Sent #${i + 1} ->`, info.messageId);
      })
      .catch((err) => {
        console.error(`❌ Failed #${i + 1}:`, err.message);
      })
  );

  // Wait for all jobs
  await Promise.all(promises);

  console.log("🏁 Stress Test complete.");
}

runStressTest();
