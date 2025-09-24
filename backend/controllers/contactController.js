// backend/controllers/contactController.js
import { validationResult } from "express-validator";
import Contact from "../models/Contact.js";
import { sendEmail } from "../utils/mailer.js";
import logger from "../config/logger.js";


/**
 * Escape text for safe insertion into HTML email bodies.
 * We still store raw trimmed values in the DB, but escape for emails.
 */
function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Basic email candidate sanity check (not RFC-perfect, but good enough to avoid accidental bad recipients)
 */
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
    // express-validator middleware should run before this handler.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("❌ Contact form validation failed", { ip: req.ip, errors: errors.array() });
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Normalize incoming values (trim everything)
    const rawName = req.body?.name ?? "";
    const rawEmail = req.body?.email ?? "";
    const rawPhone = req.body?.phone ?? "";
    const rawMessage = req.body?.message ?? "";
    const rawProducts = req.body?.products ?? "";
    const rawNotes = req.body?.notes ?? "";
    const rawType = req.body?.type ?? "contact";

    const name = String(rawName).trim();
    const email = String(rawEmail).trim();
    const phone = String(rawPhone).trim();
    const message = String(rawMessage).trim();
    const products = String(rawProducts).trim();
    const notes = String(rawNotes).trim();
    const type = String(rawType).trim().toLowerCase();

    const isQuote = type === "quote";

    // Build DB document
    const contactData = {
      name,
      email,
      phone: phone || "",
      message: message || "",
      products: products || "",
      notes: notes || "",
      type: isQuote ? "quote" : "contact",
      ip: req.ip,
      userAgent: req.get("User-Agent") || "",
      receivedAt: new Date(),
    };

    // Persist to MongoDB
    const contactMessage = await Contact.create(contactData);

    // Determine who should receive the email
    // Prefer explicit config vars CONTACT_RECEIVER / QUOTE_RECEIVER, then fallback to FROM/SMTP user, then a hard-coded fallback.
    const contactReceiver = process.env.CONTACT_RECEIVER || process.env.CONTACT_RECEIVER_CONTACT;
    const quoteReceiver = process.env.QUOTE_RECEIVER || process.env.CONTACT_RECEIVER_QUOTE;
    let toEmail = isQuote ? quoteReceiver : contactReceiver;

    if (!toEmail || !looksLikeEmail(toEmail)) {
      // fallback chain
      if (looksLikeEmail(process.env.FROM_EMAIL)) toEmail = process.env.FROM_EMAIL;
      else if (looksLikeEmail(process.env.SMTP_USER)) toEmail = process.env.SMTP_USER;
      else toEmail = "info@faharidairies.co.ke";
    }

    // Build HTML and plain-text bodies (escaped)
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

    // Fire-and-forget email send: log errors but do not prevent the API from returning success (DB saved).
    try {
      await sendEmail({
        to: toEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });
      logger.info("📧 Contact email routed", { to: toEmail, type: isQuote ? "quote" : "contact", id: contactMessage._id });
    } catch (mailErr) {
      // log details for troubleshooting — do not expose internals to client
      logger.error("❌ Failed to send contact email", {
        to: toEmail,
        type: isQuote ? "quote" : "contact",
        err: mailErr?.message || String(mailErr),
        id: contactMessage._id,
      });
    }

    logger.info(`✅ ${isQuote ? "Quote" : "Contact"} form saved`, { id: contactMessage._id, ip: req.ip });

    // Respond success (201 created)
    return res.status(201).json({
      success: true,
      message: isQuote ? "Thank you! Your quote request has been received." : "Thank you for contacting us! We'll get back to you shortly.",
      data: contactMessage,
    });
  } catch (error) {
    // Defensive logging — do not leak internals to the client.
    logger.error("❌ submitContactForm error", { err: error?.stack ?? String(error) });
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export default submitContactForm;
