// backend/models/Application.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/* -------------------- CV Subdocument -------------------- */
const cvSubSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true }, // R2 URL or local path
    fileType: { type: String, trim: true },
    fileSize: { type: Number, min: 0 }, // in bytes
  },
  { _id: false }
);

/* -------------------- Optional Attachment Subdocument -------------------- */
const attachmentSubSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileType: { type: String, trim: true },
    fileSize: { type: Number, min: 0 },
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
    attachments: {
      type: [attachmentSubSchema],
      default: [],
    },
    /* -------------------- Candidate Answers -------------------- */
    customAnswers: {
      type: [
        {
          questionId: { type: Schema.Types.ObjectId, ref: "Job.dynamicQuestions" },
          question: { type: String, trim: true },
          answer: { type: Schema.Types.Mixed, trim: true }, // string or array for checkboxes
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
      default: "careers_page",
      index: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
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
  "customAnswers.answer": "text",
});

const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
