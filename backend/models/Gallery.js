import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Gallery title is required"],
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      enum: ["product", "banner", "ad", "event", "other"],
      default: "product",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
