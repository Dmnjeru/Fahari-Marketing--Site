import Retailer from "../models/Retailer.js";
import logger from "../config/logger.js";

/**
 * @desc    Add a new retailer
 * @route   POST /api/retailers
 * @access  Private (Admin only)
 */
export const createRetailer = async (req, res) => {
  try {
    const { name, location, contact, email, website } = req.body;

    // Validate required fields
    if (!name || !location) {
      logger.warn("❌ Missing required retailer fields");
      return res
        .status(400)
        .json({ message: "Retailer name and location are required" });
    }

    const retailer = await Retailer.create({
      name,
      location,
      contact,
      email,
      website,
    });

    logger.info(`✅ Retailer created: ${retailer.name}`);
    res.status(201).json({
      success: true,
      message: "Retailer added successfully",
      data: retailer,
    });
  } catch (error) {
    logger.error(`❌ Failed to create retailer: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all retailers (paginated + search)
 * @route   GET /api/retailers
 * @access  Public
 */
export const getRetailers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const query = {
      name: { $regex: search, $options: "i" }, // Case-insensitive search
    };

    const retailers = await Retailer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalRetailers = await Retailer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: retailers.length,
      total: totalRetailers,
      currentPage: page,
      totalPages: Math.ceil(totalRetailers / limit),
      data: retailers,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch retailers: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get a single retailer by ID
 * @route   GET /api/retailers/:id
 * @access  Public
 */
export const getRetailerById = async (req, res) => {
  try {
    const retailer = await Retailer.findById(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    res.status(200).json({
      success: true,
      data: retailer,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch retailer: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update retailer info
 * @route   PUT /api/retailers/:id
 * @access  Private (Admin only)
 */
export const updateRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findById(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    Object.assign(retailer, req.body);
    await retailer.save();

    logger.info(`📝 Retailer updated: ${retailer.name}`);
    res.status(200).json({
      success: true,
      message: "Retailer updated successfully",
      data: retailer,
    });
  } catch (error) {
    logger.error(`❌ Failed to update retailer: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a retailer
 * @route   DELETE /api/retailers/:id
 * @access  Private (Admin only)
 */
export const deleteRetailer = async (req, res) => {
  try {
    const retailer = await Retailer.findByIdAndDelete(req.params.id);

    if (!retailer) {
      return res.status(404).json({ message: "Retailer not found" });
    }

    logger.info(`🗑️ Retailer deleted: ${retailer.name}`);
    res
      .status(200)
      .json({ success: true, message: "Retailer deleted successfully" });
  } catch (error) {
    logger.error(`❌ Failed to delete retailer: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
