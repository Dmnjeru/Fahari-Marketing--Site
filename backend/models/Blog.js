// backend/models/Blog.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "Slug is required"],
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
    image: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/default-blog.jpg",
    },
    category: {
      type: String,
      required: [true, "Blog category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      default: "Fahari Yoghurt",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/*
  Note:
  - No pre-save slug generator here. The controller writes a validated, unique slug.
  - This avoids race/duplication issues and keeps slug handling centralized.
*/

export default mongoose.model("Blog", blogSchema);
