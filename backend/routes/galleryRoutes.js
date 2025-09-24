import express from "express";
import {
  addGalleryItem,
  getGalleryItems,
  getGalleryItemBySlug,
  updateGalleryItem,
  deleteGalleryItem,
} from "../controllers/galleryController.js";

const router = express.Router();

// Public routes
router.get("/", getGalleryItems);
router.get("/:slug", getGalleryItemBySlug);

// Admin-only (future proof)
router.post("/", addGalleryItem);
router.put("/:id", updateGalleryItem);
router.delete("/:id", deleteGalleryItem);

export default router;
