import slugify from "slugify";
import Gallery from "../models/Gallery.js";
import logger from "../config/logger.js";

/**
 * @desc    Add a new gallery image
 * @route   POST /api/gallery
 * @access  Private (Admin)
 */
export const addGalleryItem = async (req, res) => {
  try {
    const { title, description, image, category, isActive } = req.body;

    if (!title || !image) {
      logger.warn("❌ Missing required gallery fields");
      return res.status(400).json({ message: "Title and image are required" });
    }

    const slug = slugify(title, { lower: true });
    const existing = await Gallery.findOne({ slug });

    if (existing) {
      logger.warn(`⚠️ Gallery item '${title}' already exists`);
      return res.status(400).json({ message: "Gallery item already exists" });
    }

    const galleryItem = await Gallery.create({
      title,
      slug,
      description,
      image,
      category,
      isActive,
    });

    logger.info(`✅ Gallery item '${galleryItem.title}' added successfully`);
    res.status(201).json({ success: true, data: galleryItem });
  } catch (error) {
    logger.error(`❌ Failed to add gallery item: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all active gallery items
 * @route   GET /api/gallery
 * @access  Public
 */
export const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;

    const galleryItems = await Gallery.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch gallery: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get a single gallery item by slug
 * @route   GET /api/gallery/:slug
 * @access  Public
 */
export const getGalleryItemBySlug = async (req, res) => {
  try {
    const galleryItem = await Gallery.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!galleryItem) {
      logger.warn(`⚠️ Gallery item '${req.params.slug}' not found`);
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.status(200).json({ success: true, data: galleryItem });
  } catch (error) {
    logger.error(`❌ Failed to fetch gallery item: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update a gallery item
 * @route   PUT /api/gallery/:id
 * @access  Private (Admin)
 */
export const updateGalleryItem = async (req, res) => {
  try {
    const updatedGallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, slug: slugify(req.body.title, { lower: true }) },
      { new: true, runValidators: true }
    );

    if (!updatedGallery) {
      logger.warn(`⚠️ Gallery item '${req.params.id}' not found`);
      return res.status(404).json({ message: "Gallery item not found" });
    }

    logger.info(`✅ Gallery item '${updatedGallery.title}' updated successfully`);
    res.status(200).json({ success: true, data: updatedGallery });
  } catch (error) {
    logger.error(`❌ Failed to update gallery item: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a gallery item
 * @route   DELETE /api/gallery/:id
 * @access  Private (Admin)
 */
export const deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

    if (!galleryItem) {
      logger.warn(`⚠️ Gallery item '${req.params.id}' not found`);
      return res.status(404).json({ message: "Gallery item not found" });
    }

    logger.info(`🗑️ Gallery item '${galleryItem.title}' deleted successfully`);
    res.status(200).json({ success: true, message: "Gallery item deleted" });
  } catch (error) {
    logger.error(`❌ Failed to delete gallery item: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
