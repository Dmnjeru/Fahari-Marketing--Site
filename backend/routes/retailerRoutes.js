import express from "express";
import {
  createRetailer,
  getRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
} from "../controllers/retailerController.js";

const router = express.Router();

/**
 * @desc Retailer Routes
 * -----------------------------
 * These routes handle all retailer-related operations.
 * The APIs are optimized for both desktop and mobile users.
 */

// @route   GET /api/retailers
// @desc    Fetch all retailers (with pagination + search)
// @access  Public
router.get("/", getRetailers);

// @route   GET /api/retailers/:id
// @desc    Fetch a single retailer by ID
// @access  Public
router.get("/:id", getRetailerById);

// @route   POST /api/retailers
// @desc    Create a new retailer
// @access  Private (Admin)
router.post("/", createRetailer);

// @route   PUT /api/retailers/:id
// @desc    Update an existing retailer
// @access  Private (Admin)
router.put("/:id", updateRetailer);

// @route   DELETE /api/retailers/:id
// @desc    Delete a retailer
// @access  Private (Admin)
router.delete("/:id", deleteRetailer);

export default router;
