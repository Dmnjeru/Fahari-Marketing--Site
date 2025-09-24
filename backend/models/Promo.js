//backend\models\Promo.js
import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Promo title is required"],
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
      required: [true, "Promo description is required"],
      minlength: 10,
      maxlength: 1000,
    },
    discount: {
      type: Number,
      default: 0, // Percentage discount
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      required: [true, "Promo image is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "Promo end date is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Promo", promoSchema);
