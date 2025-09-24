import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 1,
    },
    category: {
      type: String,
      required: true,
      enum: ["Yoghurt", "Milk", "Cheese", "Butter", "Other"],
      default: "Yoghurt",
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
