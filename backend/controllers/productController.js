import slugify from "slugify";
import Product from "../models/Product.js";
import logger from "../config/logger.js";

/**
 * @desc    Add a new product
 * @route   POST /api/products
 * @access  Private (Admin only - future proof)
 */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image, isFeatured } = req.body;

    if (!name || !description || !price || !image) {
      logger.warn("❌ Missing required product fields");
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const slug = slugify(name, { lower: true });

    // Check if product already exists
    const existing = await Product.findOne({ slug });
    if (existing) {
      logger.warn(`⚠️ Product '${name}' already exists`);
      return res.status(400).json({ message: "Product already exists" });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      image,
      isFeatured,
    });

    logger.info(`✅ Product '${product.name}' added successfully`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    logger.error(`❌ Failed to add product: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    logger.error(`❌ Failed to fetch products: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/products/:slug
 * @access  Public
 */
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, status: "active" });

    if (!product) {
      logger.warn(`⚠️ Product with slug '${req.params.slug}' not found`);
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    logger.error(`❌ Failed to fetch product: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Private (Admin only - future proof)
 */
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, slug: slugify(req.body.name, { lower: true }) },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      logger.warn(`⚠️ Product with ID '${req.params.id}' not found`);
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`✅ Product '${updatedProduct.name}' updated successfully`);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    logger.error(`❌ Failed to update product: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only - future proof)
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      logger.warn(`⚠️ Product with ID '${req.params.id}' not found`);
      return res.status(404).json({ message: "Product not found" });
    }

    logger.info(`🗑️ Product '${product.name}' deleted successfully`);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    logger.error(`❌ Failed to delete product: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
