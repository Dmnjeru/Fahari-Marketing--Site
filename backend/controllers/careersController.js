// backend/controllers/careersController.js
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { uploadFileToR2 } from "../utils/r2.js";
import sendEmail from "../utils/sendEmail.js"; // expected signature: sendEmail({ to, subject, html, text, attachments })
import logger from "../config/logger.js";

/**
 * Helpers
 */
function makePublicFileUrl(fileName) {
  const base = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.S3_ENDPOINT || "").replace(/\/$/, "");
  return base ? `${base}/${fileName}` : fileName;
}

function safeFileName(name = "file") {
  return String(name)
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "")
    .slice(0, 240);
}

function looksLikeEmail(v) {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/* --------------------------- Jobs --------------------------- */

export const getAllJobs = async (req, res) => {
  try {
    const {
      status = "active",
      q,
      type,
      location,
      department,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(100, parseInt(limit, 10) || 20);

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (location) filter.location = new RegExp(String(location), "i");

    if (!req.user?.isAdmin) {
      filter.$or = [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: new Date() } },
      ];
    }

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [...(filter.$or || []), { title: regex }, { description: regex }, { tags: regex }];
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: jobs,
      meta: { page: pageNum, limit: perPage, total },
    });
  } catch (err) {
    logger.error(`getAllJobs failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "JOBS_FETCH_ERROR",
      message: "Failed to fetch jobs",
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    logger.error(`getJobById failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "JOB_FETCH_ERROR",
      message: "Failed to fetch job",
    });
  }
};

export const createJob = async (req, res) => {
  try {
    const payload = { ...req.body, postedBy: req.user?.id };
    const job = await Job.create(payload);
    logger.info(`Job created: ${job.title} by ${req.user?.email ?? "unknown"}`);
    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    logger.error(`createJob failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "JOB_CREATE_ERROR",
      message: "Failed to create job",
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    logger.info(`Job updated: ${job.title} by ${req.user?.email ?? "unknown"}`);
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    logger.error(`updateJob failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "JOB_UPDATE_ERROR",
      message: "Failed to update job",
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    logger.info(`Job deleted: ${job.title} by ${req.user?.email ?? "unknown"}`);
    return res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) {
    logger.error(`deleteJob failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "JOB_DELETE_ERROR",
      message: "Failed to delete job",
    });
  }
};

/* --------------------------- Applications --------------------------- */

/**
 * POST /api/careers/apply
 * Expects multer `req.file` present (upload.single('cv'))
 */
export const applyForJob = async (req, res) => {
  try {
    const { jobId, fullName, email, phone, coverLetter, customAnswers: rawAnswers } = req.body;

    if (!jobId) return res.status(400).json({ success: false, code: "JOBID_REQUIRED", message: "jobId is required" });
    if (!fullName) return res.status(400).json({ success: false, code: "NAME_REQUIRED", message: "fullName is required" });
    if (!email || !looksLikeEmail(email)) return res.status(400).json({ success: false, code: "EMAIL_INVALID", message: "Valid email is required" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });

    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, code: "CV_REQUIRED", message: "CV file is required" });
    }

    // Build storage key
    const safeName = safeFileName(req.file.originalname || `cv-${email}`);
    const key = `careers/cv-${Date.now()}-${safeName}`;

    // Upload to R2 - top priority: URL returned by uploadFileToR2
    let publicUrl = "";
    try {
      // uploadFileToR2(buffer, key, contentType) -> should return a public URL (or throw)
      const uploadResult = await uploadFileToR2(req.file.buffer, key, req.file.mimetype);
      // uploadFileToR2 may return a string URL or an object; handle both
      if (!uploadResult) {
        throw new Error("uploadFileToR2 returned empty result");
      }
      publicUrl = typeof uploadResult === "string" ? uploadResult : uploadResult.url || makePublicFileUrl(key);
      logger.info(`📁 CV uploaded to R2: ${publicUrl}`);
    } catch (uplErr) {
      logger.warn(`uploadFileToR2 failed (continuing): ${uplErr?.message ?? uplErr}`);
      // fallback: derive public path if you host R2 files behind a public endpoint (CLOUDFLARE_R2_PUBLIC_URL)
      publicUrl = makePublicFileUrl(key);
    }

    // Parse custom answers if provided as JSON string
    let customAnswers = [];
    if (rawAnswers) {
      try {
        customAnswers = typeof rawAnswers === "string" ? JSON.parse(rawAnswers) : rawAnswers;
      } catch {
        customAnswers = rawAnswers;
      }
    }

    // Persist application (store R2 key + URL)
    const application = await Application.create({
      job: jobId,
      fullName,
      email: email.toLowerCase(),
      phone: phone || "",
      coverLetter: coverLetter || "",
      cv: {
        fileName: key,
        fileUrl: publicUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
      customAnswers,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "",
    });

    // increment job applicationsCount (non-critical)
    try {
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } }).exec();
    } catch (incErr) {
      logger.warn(`Failed to increment job applicationsCount: ${incErr?.message ?? incErr}`);
    }

    // Acknowledgement to applicant (non-blocking)
    (async () => {
      try {
        await sendEmail({
          to: email,
          subject: `Application Received — ${job.title}`,
          html: `<p>Dear ${fullName},</p>
                 <p>Thank you for applying for <strong>${job.title}</strong>. We have received your application and will review it shortly.</p>
                 <p>Best regards,<br/>Fahari HR</p>`,
          text: `Dear ${fullName},\n\nThank you for applying for ${job.title}. We have received your application and will review it shortly.\n\nBest regards,\nFahari HR`,
        });
        // mark emailSent flag
        try {
          application.emailSent = true;
          await application.save();
        } catch (saveErr) {
          logger.warn(`Failed to mark application.emailSent: ${saveErr?.message ?? saveErr}`);
        }
      } catch (appMailErr) {
        logger.warn(`Failed to send applicant acknowledgement: ${appMailErr?.message ?? appMailErr}`);
      }
    })();

    // Notify HR with CV attached (if HR_EMAIL configured)
    const hrEmail = process.env.HR_EMAIL || process.env.CONTACT_RECEIVER || process.env.CONTACT_RECEIVER_CONTACT;
    if (hrEmail && looksLikeEmail(hrEmail)) {
      const hrSubject = `New Application — ${job.title} (${fullName})`;
      const hrHtml = `<p>A new application has been submitted for <strong>${job.title}</strong></p>
                      <ul>
                        <li><strong>Name</strong>: ${fullName}</li>
                        <li><strong>Email</strong>: ${email}</li>
                        <li><strong>Phone</strong>: ${phone || "-"}</li>
                        <li><strong>Applied At</strong>: ${new Date(application.createdAt).toISOString()}</li>
                        <li><strong>CV</strong>: <a href="${publicUrl}" target="_blank">Download</a></li>
                      </ul>
                      <p>Cover Letter:</p>
                      <pre style="white-space:pre-wrap;">${coverLetter || "(none)"}</pre>`;

      const attachments = [
        {
          filename: req.file.originalname || "cv",
          content: req.file.buffer,
          contentType: req.file.mimetype,
        },
      ];

      try {
        await sendEmail({
          to: hrEmail,
          subject: hrSubject,
          html: hrHtml,
          text: `New application for ${job.title} from ${fullName}. CV: ${publicUrl}`,
          attachments,
        });
      } catch (hrErr) {
        logger.warn(`Failed to send HR notification: ${hrErr?.message ?? hrErr}`);
      }
    } else {
      logger.warn("HR_EMAIL not configured or invalid; skipping HR notification");
    }

    logger.info(`New application created: ${application._id} for job ${job.title}`);
    return res.status(201).json({ success: true, data: { id: application._id }, message: "Application submitted" });
  } catch (err) {
    // Handle duplicate (same job + same email) index error
    if (err && err.code === 11000) {
      logger.warn(`Duplicate application prevented: ${JSON.stringify(err.keyValue)}`);
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_APPLICATION",
        message: "You have already applied for this job with this email.",
      });
    }
    logger.error(`applyForJob failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "APPLICATION_ERROR",
      message: "Failed to submit application",
    });
  }
};

/* --------------------------- Admin: applications --------------------------- */

/* getAllApplications, getApplication, updateApplicationStatus, deleteApplication, counts */

export const getAllApplications = async (req, res) => {
  try {
    const { status, jobId, email, page = 1, limit = 50, q } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(200, parseInt(limit, 10) || 50);

    const filter = {};
    if (status) filter.status = status;
    if (jobId) filter.job = jobId;
    if (email) filter.email = String(email).toLowerCase();

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { coverLetter: regex }, { "cv.fileName": regex }];
    }

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate("job", "title location department type")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Application.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      meta: { page: pageNum, limit: perPage, total },
    });
  } catch (err) {
    logger.error(`getAllApplications failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "APPLICATION_FETCH_ERROR",
      message: "Failed to fetch applications",
    });
  }
};

export const getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate("job", "title location department type").lean();
    if (!app) {
      return res.status(404).json({ success: false, code: "APPLICATION_NOT_FOUND", message: "Application not found" });
    }
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`getApplication failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "APPLICATION_FETCH_ERROR",
      message: "Failed to fetch application",
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, notifyCandidate } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, code: "APPLICATION_NOT_FOUND", message: "Application not found" });
    }

    if (status) app.status = status;
    if (notes !== undefined) app.notes = String(notes);
    await app.save();

    if (notifyCandidate && app.email) {
      sendEmail({
        to: app.email,
        subject: `Application Update — ${app.status}`,
        html: `<p>Hi ${app.fullName},</p>
               <p>Your application status has been updated to <strong>${app.status}</strong>.</p>
               ${app.notes ? `<p>Notes: ${app.notes}</p>` : ""}<p>Regards,<br/>Fahari HR</p>`,
        text: `Hi ${app.fullName},\n\nYour application status has been updated to ${app.status}.\n\n${app.notes ? `Notes: ${app.notes}\n\n` : ""}Regards,\nFahari HR`,
      }).catch((err) => logger.warn(`Failed to notify candidate: ${err?.message ?? err}`));
    }

    logger.info(`Application ${app._id} updated to ${app.status} by ${req.user?.email ?? "system"}`);
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`updateApplicationStatus failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "APPLICATION_UPDATE_ERROR",
      message: "Failed to update application",
    });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, code: "APPLICATION_NOT_FOUND", message: "Application not found" });
    }

    try {
      if (app.job) {
        await Job.findByIdAndUpdate(app.job, { $inc: { applicationsCount: -1 } });
      }
    } catch (decErr) {
      logger.warn(`Failed to decrement job applicationsCount: ${decErr?.message ?? decErr}`);
    }

    logger.info(`Application ${req.params.id} deleted by ${req.user?.email ?? "system"}`);
    return res.status(200).json({ success: true, message: "Application deleted" });
  } catch (err) {
    logger.error(`deleteApplication failed: ${err?.message ?? err}`);
    return res.status(500).json({
      success: false,
      code: "APPLICATION_DELETE_ERROR",
      message: "Failed to delete application",
    });
  }
};

/* --------------------------- Quick Counts --------------------------- */

export const applicationsCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({});
    return res.status(200).json({ success: true, count });
  } catch (err) {
    logger.error(`applicationsCount failed: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, code: "COUNT_ERROR", message: "Failed to count applications" });
  }
};

export const jobsCount = async (req, res) => {
  try {
    const count = await Job.countDocuments({});
    return res.status(200).json({ success: true, count });
  } catch (err) {
    logger.error(`jobsCount failed: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, code: "COUNT_ERROR", message: "Failed to count jobs" });
  }
};
