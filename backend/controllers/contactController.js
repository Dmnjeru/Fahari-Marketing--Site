// backend/controllers/contactController.js
import { validationResult } from "express-validator";
import Contact from "../models/Contact.js";
import mailer from "../utils/mailer.js";   // ✅ use the new mailer
import logger from "../config/logger.js";

/**
 * Escape text for safe insertion into HTML email bodies.
 */
function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function looksLikeEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/**
 * @desc    Handle contact & quote form submissions
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("❌ Contact form validation failed", { ip: req.ip, errors: errors.array() });
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Normalize
    const {
      name: rawName = "",
      email: rawEmail = "",
      phone: rawPhone = "",
      message: rawMessage = "",
      products: rawProducts = "",
      notes: rawNotes = "",
      type: rawType = "contact",
    } = req.body;

    const name = rawName.trim();
    const email = rawEmail.trim();
    const phone = rawPhone.trim();
    const message = rawMessage.trim();
    const products = rawProducts.trim();
    const notes = rawNotes.trim();
    const type = rawType.trim().toLowerCase();

    const isQuote = type === "quote";

    // DB doc
    const contactData = {
      name,
      email,
      phone,
      message,
      products,
      notes,
      type: isQuote ? "quote" : "contact",
      ip: req.ip,
      userAgent: req.get("User-Agent") || "",
      receivedAt: new Date(),
    };

    const contactMessage = await Contact.create(contactData);

    // Recipient
    const contactReceiver = process.env.CONTACT_RECEIVER;
    const quoteReceiver = process.env.QUOTE_RECEIVER;
    let toEmail = isQuote ? quoteReceiver : contactReceiver;

    if (!toEmail || !looksLikeEmail(toEmail)) {
      if (looksLikeEmail(process.env.FROM_EMAIL)) toEmail = process.env.FROM_EMAIL;
      else if (looksLikeEmail(process.env.SMTP_USER)) toEmail = process.env.SMTP_USER;
      else toEmail = "info@faharidairies.co.ke";
    }

    // Bodies
    const esc = (s) => escapeHtml(s || "");
    const subject = isQuote ? "📩 Fahari — New Quote Request" : "📩 Fahari — New Contact Message";

    const htmlBody = isQuote
      ? `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone) || "N/A"}</p>
        <p><strong>Products:</strong><br/>${esc(products) || "N/A"}</p>
        <p><strong>Notes:</strong><br/>${esc(notes) || "N/A"}</p>
        <hr/>
        <p>Received via Fahari Yoghurt website — ${esc(req.get("referer") || "")}</p>
      `
      : `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${esc(name)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Phone:</strong> ${esc(phone) || "N/A"}</p>
        <p><strong>Message:</strong><br/>${esc(message)}</p>
        <hr/>
        <p>Received via Fahari Yoghurt website — ${esc(req.get("referer") || "")}</p>
      `;

    const textBody = isQuote
      ? [
          "New Quote Request",
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "N/A"}`,
          `Products: ${products || "N/A"}`,
          `Notes: ${notes || "N/A"}`,
        ].join("\n")
      : [
          "New Contact Message",
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "N/A"}`,
          `Message: ${message}`,
        ].join("\n");

    // ✅ Use the new mailer
    try {
      await mailer.sendEmail({
        to: toEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });
      logger.info("📧 Contact email routed", { to: toEmail, type: isQuote ? "quote" : "contact", id: contactMessage._id });
    } catch (mailErr) {
      logger.error("❌ Failed to send contact email", {
        to: toEmail,
        type: isQuote ? "quote" : "contact",
        err: mailErr?.message || String(mailErr),
        id: contactMessage._id,
      });
    }

    logger.info(`✅ ${isQuote ? "Quote" : "Contact"} form saved`, { id: contactMessage._id, ip: req.ip });

    return res.status(201).json({
      success: true,
      message: isQuote
        ? "Thank you! Your quote request has been received."
        : "Thank you for contacting us! We'll get back to you shortly.",
      data: contactMessage,
    });
  } catch (error) {
    logger.error("❌ submitContactForm error", { err: error?.stack ?? String(error) });
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export default submitContactForm;
