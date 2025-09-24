// backend/routes/formRoutes.js
import express from "express";
import { routeFormSubmission } from "../utils/formRouter.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  const { type, ...formData } = req.body; // type = "contact", "quote", etc.

  if (!type) return res.status(400).json({ success: false, message: "Form type required" });

  try {
    await routeFormSubmission(type, formData);
    res.json({ success: true, message: `${type} form submitted successfully` });
  } catch (err) {
    console.error("Form routing error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
