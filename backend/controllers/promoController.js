//backend\controllers\promoController.js
import slugify from "slugify";
import Promo from "../models/Promo.js";
import logger from "../config/logger.js";

/**
 * @desc    Add a new promo
 * @route   POST /api/promos
 * @access  Private (Admin only - future proof)
 */
export const addPromo = async (req, res) => {
  try {
    const {
      title,
      description,
      discount,
      image,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // ✅ Validate required fields
    if (!title || !description || !image || !endDate) {
      logger.warn("❌ Missing required promo fields");
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be provided" });
    }

    // ✅ Generate SEO-friendly slug
    const slug = slugify(title, { lower: true });

    // ✅ Prevent duplicates
    const existing = await Promo.findOne({ slug });
    if (existing) {
      logger.warn(`⚠️ Promo '${title}' already exists`);
      return res.status(400).json({ success: false, message: "Promo already exists" });
    }

    // ✅ Create promo
    const promo = await Promo.create({
      title,
      slug,
      description,
      discount,
      image,
      startDate,
      endDate,
      isActive,
    });

    logger.info(`✅ Promo '${promo.title}' created successfully`);
    res.status(201).json({ success: true, data: promo });
  } catch (error) {
    logger.error(`❌ Failed to add promo: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get all active promos (sorted by start date)
 * @route   GET /api/promos
 * @access  Public
 */
export const getPromos = async (req, res) => {
  try {
    const currentDate = new Date();
    const promos = await Promo.find({
      isActive: true,
      endDate: { $gte: currentDate },
    }).sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: promos.length,
      data: promos,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch promos: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get a single promo by slug
 * @route   GET /api/promos/:slug
 * @access  Public
 */
export const getPromoBySlug = async (req, res) => {
  try {
    const promo = await Promo.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!promo) {
      logger.warn(`⚠️ Promo with slug '${req.params.slug}' not found`);
      return res.status(404).json({ success: false, message: "Promo not found" });
    }

    res.status(200).json({ success: true, data: promo });
  } catch (error) {
    logger.error(`❌ Failed to fetch promo: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update promo details
 * @route   PUT /api/promos/:id
 * @access  Private (Admin only - future proof)
 */
export const updatePromo = async (req, res) => {
  try {
    const updates = {
      ...req.body,
    };

    // ✅ Update slug if title changes
    if (req.body.title) {
      updates.slug = slugify(req.body.title, { lower: true });
    }

    const updatedPromo = await Promo.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedPromo) {
      logger.warn(`⚠️ Promo with ID '${req.params.id}' not found`);
      return res.status(404).json({ success: false, message: "Promo not found" });
    }

    logger.info(`✅ Promo '${updatedPromo.title}' updated successfully`);
    res.status(200).json({ success: true, data: updatedPromo });
  } catch (error) {
    logger.error(`❌ Failed to update promo: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Delete a promo
 * @route   DELETE /api/promos/:id
 * @access  Private (Admin only - future proof)
 */
export const deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);

    if (!promo) {
      logger.warn(`⚠️ Promo with ID '${req.params.id}' not found`);
      return res.status(404).json({ success: false, message: "Promo not found" });
    }

    logger.info(`🗑️ Promo '${promo.title}' deleted successfully`);
    res
      .status(200)
      .json({ success: true, message: "Promo deleted successfully" });
  } catch (error) {
    logger.error(`❌ Failed to delete promo: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
