// backend/controllers/blogController.js
import Blog from "../models/Blog.js";
import logger from "../config/logger.js";
import slugify from "slugify";

/**
 * Helper to normalize tags into array of strings
 */
function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// ---------------------------
// Create a new blog post (Admin)
// ---------------------------
export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, image, category, tags, author } = req.body;

    if (!title || !content || !category) {
      logger.warn("❌ Missing required blog fields");
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      });
    }

    // Prepare blog data
    const blogData = {
      title: String(title).trim(),
      content: String(content).trim(),
      excerpt: excerpt ? String(excerpt).trim() : undefined,
      image: image ? String(image).trim() : undefined,
      category: String(category).trim(),
      tags: normalizeTags(tags),
      author: author ? String(author).trim() : "Fahari Yoghurt",
    };

    // Generate slug manually to catch duplicates early
    const baseSlug = slugify(blogData.title, { lower: true, strict: true }) || "post";
    let slug = baseSlug;
    let count = 1;

    // Keep a small guard to avoid infinite loops (very unlikely)
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count += 1;
      if (count > 1000) break;
    }
    blogData.slug = slug;

    const blog = await Blog.create(blogData);

    logger.info(`✅ New blog created: ${blog.title}`);
    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    // Duplicate key (slug) race can still happen; return 409
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyValue || {}).join(", ") || "key";
      logger.warn(`⚠️ Duplicate key on create: ${key}`);
      return res.status(409).json({ success: false, code: "DUPLICATE_KEY", message: `Duplicate ${key}` });
    }

    // Validation errors
    if (error && error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      logger.error(`❌ Blog validation failed: ${messages.join("; ")}`);
      return res.status(400).json({ success: false, message: messages.join("; ") });
    }

    logger.error(`❌ Failed to create blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

// ---------------------------
// Get all published blogs (Public, paginated)
// ---------------------------
export const getBlogs = async (req, res) => {
  try {
    // If admin flag requested and user is authorized, show all; otherwise public only
    const isAdminQuery = String(req.query.admin) === "true";
    const filter = isAdminQuery ? {} : { isPublished: true };

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 6));
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();

    const total = await Blog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    logger.error(`❌ Failed to fetch blogs: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

// ---------------------------
// Get single blog by slug (Public)
// ---------------------------
export const getBlogBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ success: false, message: "Slug is required" });

    const blog = await Blog.findOne({ slug, isPublished: true }).select("-__v -isPublished").lean();

    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // Increment views asynchronously (non-blocking)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).catch((err) =>
      logger.warn(`Failed to increment blog views: ${err?.message ?? err}`)
    );

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    logger.error(`❌ Failed to fetch blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

// ---------------------------
// Update blog (Admin)
// ---------------------------
export const updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Blog id is required" });

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const { _id, slug, ...updates } = req.body;

    // Normalize tags if present
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = normalizeTags(updates.tags);
    }

    // If title changed and slug is not explicitly provided, regenerate slug (but do not overwrite provided slug)
    if (!updates.slug && updates.title && String(updates.title).trim() !== blog.title) {
      const baseSlug = slugify(String(updates.title).trim(), { lower: true, strict: true }) || "post";
      let newSlug = baseSlug;
      let count = 1;
      while (await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } })) {
        newSlug = `${baseSlug}-${count}`;
        count += 1;
        if (count > 1000) break;
      }
      updates.slug = newSlug;
    }

    Object.assign(blog, updates);
    await blog.save();

    logger.info(`📝 Blog updated: ${blog.title}`);
    return res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    // Duplicate key when user supplied slug or generated slug collides
    if (error && error.code === 11000) {
      const key = Object.keys(error.keyValue || {}).join(", ") || "key";
      logger.warn(`⚠️ Duplicate key on update: ${key}`);
      return res.status(409).json({ success: false, code: "DUPLICATE_KEY", message: `Duplicate ${key}` });
    }

    if (error && error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      logger.error(`❌ Blog validation failed: ${messages.join("; ")}`);
      return res.status(400).json({ success: false, message: messages.join("; ") });
    }

    logger.error(`❌ Failed to update blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

// ---------------------------
// Delete blog (Admin)
// ---------------------------
export const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Blog id is required" });

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    logger.info(`🗑️ Blog deleted: ${blog.title}`);
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    logger.error(`❌ Failed to delete blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};
