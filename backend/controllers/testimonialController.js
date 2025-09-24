import Testimonial from "../models/Testimonial.js";
import logger from "../config/logger.js";

/**
 * @desc    Add a new testimonial
 * @route   POST /api/testimonials
 * @access  Public
 */
export const addTestimonial = async (req, res) => {
  try {
    const { name, email, rating, review, image } = req.body;

    if (!name || !rating || !review) {
      logger.warn("❌ Missing required testimonial fields");
      return res.status(400).json({ message: "Name, rating, and review are required" });
    }

    const testimonial = await Testimonial.create({
      name,
      email,
      rating,
      review,
      image,
    });

    logger.info(`✅ New testimonial added by ${testimonial.name}`);
    res.status(201).json({
      success: true,
      message: "Thank you for your feedback! Your review is pending approval.",
      data: testimonial,
    });
  } catch (error) {
    logger.error(`❌ Failed to add testimonial: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all approved testimonials
 * @route   GET /api/testimonials
 * @access  Public
 */
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch testimonials: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Approve or reject a testimonial
 * @route   PUT /api/testimonials/:id/approve
 * @access  Private (Admin)
 */
export const approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      logger.warn(`⚠️ Testimonial with ID '${req.params.id}' not found`);
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isApproved = req.body.isApproved ?? true;
    await testimonial.save();

    logger.info(
      `✅ Testimonial '${testimonial._id}' ${testimonial.isApproved ? "approved" : "rejected"}`
    );

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.isApproved ? "approved" : "rejected"}`,
      data: testimonial,
    });
  } catch (error) {
    logger.error(`❌ Failed to update testimonial: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Private (Admin)
 */
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      logger.warn(`⚠️ Testimonial '${req.params.id}' not found`);
      return res.status(404).json({ message: "Testimonial not found" });
    }

    logger.info(`🗑️ Testimonial '${testimonial._id}' deleted successfully`);
    res.status(200).json({ success: true, message: "Testimonial deleted" });
  } catch (error) {
    logger.error(`❌ Failed to delete testimonial: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
