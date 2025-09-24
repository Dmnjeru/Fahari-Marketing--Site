import mongoose from "mongoose";

/**
 * Retailer Schema
 * -------------------------
 * Defines the structure for retailers/distributors who stock Fahari products.
 * Optimized for fast searching and mobile-friendly API responses.
 */
const retailerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Retailer name is required"],
      trim: true,
      maxlength: [100, "Retailer name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Retailer location is required"],
      trim: true,
      maxlength: [150, "Location cannot exceed 150 characters"],
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [20, "Contact number cannot exceed 20 characters"],
      match: [/^[+0-9\s-]+$/, "Please provide a valid contact number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
        "Please provide a valid website URL",
      ],
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300x200?text=Retailer",
    },
    isVerified: {
      type: Boolean,
      default: false, // Useful if you want to manually verify retailers
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast searching by name and location
retailerSchema.index({ name: "text", location: "text" });

const Retailer = mongoose.model("Retailer", retailerSchema);

export default Retailer;
