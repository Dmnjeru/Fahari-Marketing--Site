import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },
    review: {
      type: String,
      required: [true, "Review message is required"],
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    image: {
      type: String,
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
