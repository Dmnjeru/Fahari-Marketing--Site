// backend/models/Application.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/* -------------------- CV Subdocument -------------------- */
const cvSubSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true }, // URL or local path
    fileType: { type: String, trim: true },
    fileSize: { type: Number, min: 0 }, // in bytes
  },
  { _id: false }
);

/* -------------------- Application Schema -------------------- */
const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 25,
    },
    coverLetter: {
      type: String,
      maxlength: 3000,
      trim: true,
    },
    cv: {
      type: cvSubSchema,
      required: true,
    },
    customAnswers: {
      type: [
        {
          question: { type: String, trim: true },
          answer: { type: String, trim: true },
        },
      ],
      default: [],
    },

    /* -------------------- Admin Review -------------------- */
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      maxlength: 3000,
      trim: true,
    },

    /* -------------------- Tracking & Metadata -------------------- */
    ipAddress: String,
    userAgent: String,
    viewedBy: [
      {
        adminId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    source: {
      type: String,
      trim: true,
      default: "careers_page", // could also be "referral", "linkedin", etc.
      index: true,
    },
    emailSent: {
      type: Boolean,
      default: false, // track if candidate received email confirmation
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* -------------------- Indexes -------------------- */
applicationSchema.index({ job: 1, email: 1 });
applicationSchema.index({
  fullName: "text",
  email: "text",
  coverLetter: "text",
  notes: "text",
});

const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
