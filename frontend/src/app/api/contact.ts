// src/pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  // Basic server-side validation
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Name, email, and message are required." });
  }

  try {
    // TODO: Integrate email service or database storage
    // Example using NodeMailer:
    /*
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: "sales@faharidairies.co.ke",
      subject: `Contact Form Message from ${name}`,
      text: message + (phone ? `\nPhone: ${phone}` : ""),
    });
    */

    console.log("Contact form submission:", { name, email, phone, message });

    return res.status(200).json({
      success: true,
      message: "Your message has been received successfully.",
    });
  } catch (err) {
    console.error("Error sending contact form:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error. Please try again later." });
  }
}
