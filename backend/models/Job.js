// backend/models/Job.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true, // for /careers/:slug lookups
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Remote"],
      required: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
      index: true, // allows filtering jobs by department
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 5000,
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    applicationDeadline: {
      type: Date,
      index: true, // allows queries like "jobs still accepting applications"
    },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // 🆕 Analytics fields
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // lets admin sort jobs by number of applicants quickly
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook: generate slug if missing
jobSchema.pre("validate", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Compound index: optimize job listings
jobSchema.index({ status: 1, location: 1, type: 1 });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;
