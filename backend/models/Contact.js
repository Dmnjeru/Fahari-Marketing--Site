import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Please enter a valid phone number"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: 10,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["new", "read", "responded"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
