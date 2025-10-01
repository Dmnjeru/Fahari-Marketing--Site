// backend/controllers/blogController.js
import Blog from "../models/Blog.js";
import logger from "../config/logger.js";
import slugify from "slugify";
import { uploadFileToR2 } from "../utils/r2Uploader.js";

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

/**
 * Estimate reading time (minutes) given text
 */
function estimateReadTime(text = "") {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  const wpm = 200;
  return Math.max(1, Math.round(words / wpm));
}

/**
 * Make a safe public file URL from R2 endpoint + key (fallback)
 */
function makePublicFileUrl(key) {
  const base = (process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT || "").replace(/\/$/, "");
  if (!base) return key;
  // If the bucket name is part of key-less public URLs, client will know. We return a joined URL.
  return `${base}/${key.replace(/^\/+/, "")}`;
}

/* ---------------------------
   Create a new blog post (Admin)
   --------------------------- */
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      image,
      category,
      tags,
      author,
      metaTitle,
      metaDescription,
      canonicalUrl,
      publishAt,
      isPublished: incomingIsPublished,
    } = req.body;

    if (!title || !content || !category) {
      logger.warn("❌ Missing required blog fields");
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required",
      });
    }

    // Normalize tags
    const normalizedTags = normalizeTags(tags);

    // Prepare blog data
    const now = new Date();
    const parsedPublishAt = publishAt ? new Date(publishAt) : null;
    // If publishAt is in future, default to draft unless explicitly requested
    const isFuturePublish = parsedPublishAt && parsedPublishAt > now;
    const isPublished = Boolean(incomingIsPublished) && !isFuturePublish;

    const blogData = {
      title: String(title).trim(),
      content: String(content).trim(),
      excerpt: excerpt ? String(excerpt).trim() : undefined,
      image: image ? String(image).trim() : undefined,
      category: String(category).trim(),
      tags: normalizedTags,
      author: author ? String(author).trim() : "Fahari Yoghurt",
      metaTitle: metaTitle ? String(metaTitle).trim() : undefined,
      metaDescription: metaDescription ? String(metaDescription).trim() : undefined,
      canonicalUrl: canonicalUrl ? String(canonicalUrl).trim() : undefined,
      publishAt: parsedPublishAt || null,
      isPublished: Boolean(isPublished),
      readTime: estimateReadTime(String(content)),
    };

    // Generate unique slug (guard loop to handle collisions)
    const baseSlug = slugify(blogData.title || "post", { lower: true, strict: true }) || "post";
    let slug = baseSlug;
    let i = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${i}`;
      i += 1;
      if (i > 1000) break;
    }
    blogData.slug = slug;

    const blog = await Blog.create(blogData);

    logger.info(`✅ New blog created: ${blog.title} (${blog._id})`);
    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    // Duplicate key (slug) race
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

/* ---------------------------
   Get all blogs (Public or admin)
   Supports filters: admin=true (shows drafts/future), q, tag, category, page/limit
   --------------------------- */
export const getBlogs = async (req, res) => {
  try {
    const isAdminQuery = String(req.query.admin) === "true";
    // base filter: published and publishAt <= now (unless admin)
    const now = new Date();
    const filter = {};

    if (!isAdminQuery) {
      filter.isPublished = true;
      // Only include those whose publishAt is null or <= now
      filter.$or = [{ publishAt: { $exists: false } }, { publishAt: { $lte: now } }, { publishAt: null }];
    }

    // optional filters
    if (req.query.tag) filter.tags = String(req.query.tag);
    if (req.query.category) filter.category = String(req.query.category);
    if (req.query.q) {
      const q = String(req.query.q).trim();
      const r = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [...(filter.$or || []), { title: r }, { excerpt: r }, { content: r }, { tags: r }];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select("-__v").lean(),
      Blog.countDocuments(filter),
    ]);

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

/* ---------------------------
   Get single blog by slug (Public)
   If admin=true in query, return regardless of isPublished (for preview)
   --------------------------- */
export const getBlogBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ success: false, message: "Slug is required" });

    const isAdminPreview = String(req.query.admin) === "true";
    const now = new Date();

    const findFilter = { slug };
    if (!isAdminPreview) {
      findFilter.isPublished = true;
      findFilter.$or = [{ publishAt: { $exists: false } }, { publishAt: { $lte: now } }, { publishAt: null }];
    }

    const blog = await Blog.findOne(findFilter).select("-__v").lean();
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // increment views asynchronously (non-blocking)
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).catch((err) =>
      logger.warn(`Failed to increment blog views: ${err?.message ?? err}`)
    );

    // ensure readTime present
    blog.readTime = blog.readTime ?? estimateReadTime(blog.content || "");

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    logger.error(`❌ Failed to fetch blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

/* ---------------------------
   Update blog (Admin)
   - supports tags normalization, slug regeneration if title changed
   - recalculates readTime
   --------------------------- */
export const updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Blog id is required" });

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const updates = { ...req.body };

    // Normalize tags
    if (updates.tags && !Array.isArray(updates.tags)) {
      updates.tags = normalizeTags(updates.tags);
    }

    // If title changed and no slug provided, regenerate slug
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

    // Manage publishAt/isPublished: if publishAt is in future, ensure isPublished is false
    if (updates.publishAt) {
      const parsedPublishAt = new Date(updates.publishAt);
      if (!isNaN(parsedPublishAt.getTime()) && parsedPublishAt > new Date()) {
        updates.isPublished = false;
      }
    }

    // recalc readTime if content present
    if (updates.content !== undefined) {
      updates.readTime = estimateReadTime(String(updates.content));
    }

    Object.assign(blog, updates);
    await blog.save();

    logger.info(`📝 Blog updated: ${blog.title} (${blog._id})`);
    return res.status(200).json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    // Duplicate key (slug collisions)
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

/* ---------------------------
   Delete blog (Admin)
   --------------------------- */
export const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: "Blog id is required" });

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    logger.info(`🗑️ Blog deleted: ${blog.title} (${blog._id})`);
    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    logger.error(`❌ Failed to delete blog: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Server error: " + (error?.message ?? String(error)) });
  }
};

/* ---------------------------
   Upload media (Admin)
   Expects multer to have populated req.file (single file).
   Uses r2Uploader.uploadFileToR2 and returns { key, url }.
   --------------------------- */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const file = req.file;
    const originalName = file.originalname || `upload-${Date.now()}`;
    // store under 'blogs/' folder in R2
    const folder = "blogs";
    // uploadFileToR2(fileBuffer, fileName, folder = "", expiresIn = 3600)
    const result = await uploadFileToR2(file.buffer, originalName, folder, Number(process.env.R2_UPLOAD_EXPIRES || 86400));
    // result: { key, signedUrl, result }
    const url = result?.signedUrl || makePublicFileUrl(result?.key || `${folder}/${originalName}`);
    logger.info(`📤 R2 upload successful: ${result?.key || originalName}`);
    return res.status(200).json({ success: true, data: { key: result?.key, url } });
  } catch (error) {
    logger.error(`❌ Media upload failed: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Upload failed: " + (error?.message ?? String(error)) });
  }
};

/* ---------------------------
   AI generation helper
   POST /api/admin/blogs/generate
   Body: { prompt, title?, excerpt? }
   Uses OPENAI_API_KEY if available (fallback 501).
   --------------------------- */
export const generateWithAI = async (req, res) => {
  try {
    const { prompt, title, excerpt } = req.body;
    if (!prompt || !String(prompt).trim()) return res.status(400).json({ success: false, message: "prompt is required" });

    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      logger.warn("AI generate requested but OPENAI_API_KEY not configured");
      return res.status(501).json({ success: false, message: "AI provider not configured" });
    }

    // Build a helpful prompt wrapper
    const userPrompt = `
You are an assistant that writes blog content with helpful structure.
Context (optional): ${title ? `Title: ${title}` : "(none)"} ${excerpt ? `Excerpt: ${excerpt}` : ""}
Instruction: ${String(prompt).trim()}
Respond with plain text content (no JSON). Keep paragraphs and headings.`;

    // Use node global fetch to call OpenAI chat completions (gpt-3.5-turbo).
    // Note: This is a conservative implementation that works with OpenAI REST API.
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [{ role: "user", content: userPrompt }],
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.8),
        max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 700),
        n: 1,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      logger.warn(`AI provider returned non-OK: ${resp.status} ${text}`);
      return res.status(502).json({ success: false, message: "AI provider error" });
    }

    const data = await resp.json();
    const content = (data?.choices?.[0]?.message?.content) || (data?.choices?.[0]?.text) || "";
    logger.info("✅ AI content generated (length: " + String((content || "").length) + ")");

    return res.status(200).json({ success: true, data: { content } });
  } catch (error) {
    logger.error("❌ AI generation failed:", error?.message ?? error);
    return res.status(500).json({ success: false, message: "AI generation failed: " + (error?.message ?? String(error)) });
  }
};

/* ---------------------------
   Default export for compatibility
   --------------------------- */
export default {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  uploadMedia,
  generateWithAI,
};
