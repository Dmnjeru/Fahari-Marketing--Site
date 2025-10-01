// backend/models/Blog.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    key: { type: String, required: true }, // R2 key, e.g. "blogs/12345-image.png"
    url: { type: String }, // signed URL or public URL (cached)
    filename: { type: String },
    contentType: { type: String },
    size: { type: Number }, // bytes
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 200,
    },

    // slug should be created/validated by controller to avoid race issues,
    // but we still normalize it here (lowercase/trim)
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "Slug is required"],
      maxlength: 250,
    },

    content: {
      type: String,
      required: [true, "Blog content is required"],
      minlength: [20, "Content must be at least 20 characters"],
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    // Primary image for preview / og:image
    image: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/default-blog.jpg",
    },

    // Media attachments (images, pdfs, etc.) stored in R2
    media: {
      type: [mediaSchema],
      default: [],
    },

    category: {
      type: String,
      required: [true, "Blog category is required"],
      trim: true,
    },

    tags: {
      type: [String],
      index: true,
      default: [],
    },

    // Simple author fields (display + optional id reference)
    author: {
      type: String,
      default: "Fahari Yoghurt",
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Publication controls
    isPublished: {
      type: Boolean,
      default: false, // default to draft — controller decides final state
    },
    publishAt: {
      type: Date,
      default: null, // scheduling support
    },

    // SEO fields
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true, maxlength: 320 },
    canonicalUrl: { type: String, trim: true },

    // Analytics & helpers
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // minutes
      default: 0,
    },

    // Extra flags
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual: status
 * - "scheduled" when publishAt in future
 * - "published" when isPublished true and publishAt <= now (or null)
 * - "draft" otherwise
 */
blogSchema.virtual("status").get(function () {
  const now = new Date();
  if (this.publishAt && this.publishAt > now) return "scheduled";
  if (this.isPublished) return "published";
  return "draft";
});

/**
 * Light normalization on validate: ensure slug is trimmed + lowercased.
 * Note: do not auto-generate slug here — generation is handled in controller to
 * manage uniqueness / collision handling centrally.
 */
blogSchema.pre("validate", function (next) {
  if (this.slug && typeof this.slug === "string") {
    this.slug = this.slug.trim().toLowerCase();
  }
  next();
});

/**
 * Text index for search across title / excerpt / content.
 * If you want more granular control, create indexes in a migration or via DB,
 * but creating here is convenient for development.
 */
blogSchema.index({ title: "text", excerpt: "text", content: "text" });
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ isPublished: 1, publishAt: 1 });

/*
  Notes:
  - Slug uniqueness is enforced with a unique index, but controller attempts to
    generate a collision-free slug first to avoid 11000 errors.
  - readTime: the controller calculates and writes this on create/update.
  - media[] is optional and holds metadata about uploaded R2 files.
*/

export default mongoose.model("Blog", blogSchema);
