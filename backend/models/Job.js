// backend/models/Job.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/* -------------------- Dynamic Question Subdocument -------------------- */
const dynamicQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "textarea", "radio", "checkbox", "select", "file"],
      required: true,
      default: "text",
    },
    options: { type: [String], default: [] }, // for radio/select/checkbox
    required: { type: Boolean, default: false },
    addedBy: { type: Schema.Types.ObjectId, ref: "AdminUser" }, // optional audit
  },
  { _id: true } // allows referencing in Application.customAnswers.questionId
);

/* -------------------- Job Schema -------------------- */
const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, lowercase: true, unique: true, trim: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Remote"],
      required: true,
      index: true,
    },
    department: { type: String, trim: true, index: true },
    salaryRange: { type: String, trim: true },
    description: { type: String, required: true, minlength: 20, maxlength: 5000 },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    applicationDeadline: { type: Date, index: true },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active", index: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User" },

    /* -------------------- Analytics -------------------- */
    views: { type: Number, default: 0, min: 0 },
    applicationsCount: { type: Number, default: 0, min: 0, index: true },

    /* -------------------- Dynamic Application Questions -------------------- */
    dynamicQuestions: { type: [dynamicQuestionSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* -------------------- Pre-save hook: slug -------------------- */
jobSchema.pre("validate", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

/* -------------------- Indexes -------------------- */
jobSchema.index({ status: 1, location: 1, type: 1 });
jobSchema.index({ title: "text", description: "text", tags: "text" });

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;
