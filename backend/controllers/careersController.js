// backend/controllers/careersController.js
/**
 * Careers controller
 * ------------------
 * - Provides job CRUD and application handling (including CV upload -> R2 + HR email attachments)
 * - Defensive: supports multer.single, multer.array, and multer.fields shapes for uploaded files
 * - Detailed logging and clear response shapes
 */

import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { uploadFileToR2 } from "../utils/r2Uploader.js";
import { sendEmail } from "../utils/mailer.js";
import logger from "../config/logger.js";

/* -------------------- Helpers -------------------- */

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

function escapeHtml(input = "") {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Normalize incoming customAnswers into array of objects:
 * [{ questionId?, questionText?, answer }]
 */
function normalizeCustomAnswers(rawAnswers, job) {
  if (!rawAnswers) return [];

  let parsed = rawAnswers;
  if (typeof rawAnswers === "string") {
    try {
      parsed = JSON.parse(rawAnswers);
    } catch {
      // treat as plain text
      return [{ questionText: "custom", answer: String(rawAnswers) }];
    }
  }

  if (!Array.isArray(parsed)) {
    return [{ questionText: "custom", answer: String(parsed) }];
  }

  const questionsById = new Map();
  const questionsByText = new Map();
  if (job?.dynamicQuestions && Array.isArray(job.dynamicQuestions)) {
    for (const q of job.dynamicQuestions) {
      if (q._id) questionsById.set(String(q._id), q);
      if (q.questionText) questionsByText.set(String(q.questionText).trim().toLowerCase(), q);
    }
  }

  return parsed.map((item) => {
    if (typeof item === "string") return { questionText: "custom", answer: item };

    const qi = item.questionId || item.question_id || item.question || null;
    const ans = item.answer ?? item.value ?? item.response ?? "";

    if (qi && questionsById.has(String(qi))) {
      const q = questionsById.get(String(qi));
      return { questionId: String(q._id), questionText: q.questionText, answer: String(ans) };
    }

    const qiText = qi ? String(qi).trim().toLowerCase() : null;
    if (qiText && questionsByText.has(qiText)) {
      const q = questionsByText.get(qiText);
      return { questionId: String(q._id), questionText: q.questionText, answer: String(ans) };
    }

    if (item.questionText) {
      const k = String(item.questionText).trim().toLowerCase();
      if (questionsByText.has(k)) {
        const q = questionsByText.get(k);
        return { questionId: String(q._id), questionText: q.questionText, answer: String(ans) };
      }
    }

    return { questionText: item.question ?? item.questionText ?? "custom", answer: String(ans) };
  });
}

/**
 * Extract a usable URL from the r2Uploader result
 */
function getUrlFromUploadResult(result, fallbackKey) {
  if (!result) return makePublicFileUrl(fallbackKey);
  // If uploader returns a string (legacy)
  if (typeof result === "string") return result;
  // common field names used in our uploader: signedUrl, url
  if (result.signedUrl) return result.signedUrl;
  if (result.url) return result.url;
  // fallback to public derived URL
  return makePublicFileUrl(fallbackKey);
}

/* --------------------------- Jobs --------------------------- */

export const getAllJobs = async (req, res) => {
  try {
    const { status = "active", q, type, location, department, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(100, parseInt(limit, 10) || 20);

    const filter = {};
    if (status && status !== "all") filter.status = status;
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
      Job.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * perPage).limit(perPage).lean(),
      Job.countDocuments(filter),
    ]);

    logger.info(`getAllJobs: returned ${jobs.length} / ${total} (page ${pageNum}, limit ${perPage})`);
    return res.status(200).json({ success: true, data: jobs, meta: { page: pageNum, limit: perPage, total } });
  } catch (err) {
    logger.error(`getAllJobs failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "JOBS_FETCH_ERROR", message: "Failed to fetch jobs" });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      logger.warn(`getJobById: job not found (${req.params.id})`);
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    logger.error(`getJobById failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "JOB_FETCH_ERROR", message: "Failed to fetch job" });
  }
};

export const createJob = async (req, res) => {
  try {
    const payload = { ...req.body, postedBy: req.user?.id };
    const job = await Job.create(payload);
    logger.info(`Job created: ${job.title} (${job._id}) by ${req.user?.email ?? "unknown"}`);
    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    logger.error(`createJob failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "JOB_CREATE_ERROR", message: "Failed to create job" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) {
      logger.warn(`updateJob: job not found (${req.params.id})`);
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    logger.info(`Job updated: ${job.title} (${job._id}) by ${req.user?.email ?? "unknown"}`);
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    logger.error(`updateJob failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "JOB_UPDATE_ERROR", message: "Failed to update job" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      logger.warn(`deleteJob: job not found (${req.params.id})`);
      return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });
    }
    logger.info(`Job deleted: ${job.title} (${job._id}) by ${req.user?.email ?? "unknown"}`);
    return res.status(200).json({ success: true, message: "Job deleted" });
  } catch (err) {
    logger.error(`deleteJob failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "JOB_DELETE_ERROR", message: "Failed to delete job" });
  }
};

/* --------------------------- Applications --------------------------- */

/**
 * POST /api/careers/apply
 * - Accepts files via multer.single / multer.array / multer.fields
 * - Uploads files to R2 (if available) and stores metadata in Application.cv
 * - Sends acknowledgement email to applicant (fire-and-forget)
 * - Sends HR notification with attachments (buffers) where available
 */
export const applyForJob = async (req, res) => {
  try {
    // Accept multiple body shapes
    const jobId = req.body.jobId || req.body.job || req.body.job_id;
    const fullName = req.body.fullName || req.body.full_name || req.body.name;
    const rawEmail = req.body.email;
    const phone = req.body.phone;
    const coverLetter = req.body.coverLetter || req.body.cover_letter || req.body.message || "";
    const rawAnswers = req.body.customAnswers ?? req.body.answers ?? req.body.custom_answers;

    // Basic validation
    if (!jobId) return res.status(400).json({ success: false, code: "JOBID_REQUIRED", message: "jobId is required" });
    if (!fullName) return res.status(400).json({ success: false, code: "NAME_REQUIRED", message: "fullName is required" });
    if (!rawEmail || !looksLikeEmail(rawEmail)) return res.status(400).json({ success: false, code: "EMAIL_INVALID", message: "Valid email is required" });

    const email = String(rawEmail).trim().toLowerCase();

    const job = await Job.findById(jobId).lean();
    if (!job) return res.status(404).json({ success: false, code: "JOB_NOT_FOUND", message: "Job not found" });

    // Collect uploaded files robustly:
    // - multer.single -> req.file
    // - multer.array -> req.files (array)
    // - multer.fields -> req.files as object: { cv: [..], attachments: [..] }
    const uploadedFiles = [];
    if (req.file) uploadedFiles.push(req.file);

    if (req.files) {
      if (Array.isArray(req.files)) {
        uploadedFiles.push(...req.files);
      } else if (typeof req.files === "object") {
        for (const key of Object.keys(req.files)) {
          const arr = req.files[key];
          if (Array.isArray(arr)) uploadedFiles.push(...arr);
        }
      }
    }

    if (uploadedFiles.length === 0) {
      logger.warn(`applyForJob: no files uploaded for ${email} applying to ${jobId}`);
      return res.status(400).json({ success: false, code: "CV_REQUIRED", message: "CV file is required" });
    }

    // Upload each file to R2 (correct parameter order: (buffer, fileName, folder, expiresIn) )
    const uploadPromises = uploadedFiles.map(async (f, idx) => {
      const origName = (f.originalname || `cv-${email}-${idx + 1}`).toString();
      const safeName = safeFileName(origName);
      try {
        if (typeof uploadFileToR2 === "function") {
          // pass original name and folder 'careers' so uploader builds the key consistently
          const result = await uploadFileToR2(f.buffer, safeName, "careers", Number(process.env.R2_SIGNED_URL_EXPIRES || 3600));
          const url = getUrlFromUploadResult(result, /*fallbackKey=*/`careers/${Date.now()}-${safeName}`);
          const key = (result && result.key) || `careers/${Date.now()}-${safeName}`;
          logger.info(`R2 upload ok: ${key} -> ${url}`);
          return { key, url, originalName: origName, mimetype: f.mimetype, size: f.size, buffer: f.buffer };
        } else {
          const key = `careers/${Date.now()}-${safeName}`;
          const derived = makePublicFileUrl(key);
          logger.warn("uploadFileToR2 not available, using derived URL", { key });
          return { key, url: derived, originalName: origName, mimetype: f.mimetype, size: f.size, buffer: f.buffer };
        }
      } catch (uplErr) {
        logger.warn(`uploadFileToR2 failed for ${origName}: ${uplErr?.message ?? uplErr}`);
        const key = `careers/${Date.now()}-${safeName}`;
        const derived = makePublicFileUrl(key);
        return { key, url: derived, originalName: origName, mimetype: f.mimetype, size: f.size, buffer: f.buffer };
      }
    });

    const uploaded = await Promise.all(uploadPromises);

    // Normalize custom answers
    const customAnswers = normalizeCustomAnswers(rawAnswers, job);

    // Build application payload
    const mainCv = uploaded[0];
    const applicationPayload = {
      job: jobId,
      fullName: String(fullName).trim(),
      email,
      phone: phone || "",
      coverLetter: String(coverLetter || ""),
      cv: {
        fileName: mainCv.key,
        fileUrl: mainCv.url,
        fileType: mainCv.mimetype,
        fileSize: mainCv.size,
      },
      attachments: uploaded.slice(1).map((u) => ({
        fileName: u.key,
        fileUrl: u.url,
        fileType: u.mimetype,
        fileSize: u.size,
      })),
      customAnswers,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "",
    };

    const application = await Application.create(applicationPayload);

    // increment applicationsCount (best-effort)
    try {
      await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } }).exec();
    } catch (incErr) {
      logger.warn(`Failed to increment job applicationsCount: ${incErr?.message ?? incErr}`);
    }

    // Fire-and-forget acknowledgement email to applicant (mark emailSent when ok)
    (async () => {
      try {
        if (typeof sendEmail === "function") {
          await sendEmail({
            to: email,
            subject: `Application Received — ${job.title}`,
            html: `<p>Dear ${escapeHtml(String(fullName))},</p>
                   <p>Thank you for applying for <strong>${escapeHtml(String(job.title))}</strong>. We have received your application and will review it shortly.</p>
                   <p>Best regards,<br/>Fahari Yoghurt &amp; Dairies</p>`,
            text: `Dear ${String(fullName)},\n\nThank you for applying for ${job.title}. We have received your application and will review it shortly.\n\nBest regards,\nFahari Yoghurt & Dairies`,
          });
          application.emailSent = true;
          await application.save();
          logger.info(`Acknowledgement email sent to applicant ${email} (application: ${application._id})`);
        } else {
          logger.warn("sendEmail not available - acknowledgement not sent");
        }
      } catch (ackErr) {
        logger.warn(`Failed to send acknowledgement to ${email}: ${ackErr?.message ?? ackErr}`);
      }
    })();

    // Notify HR/admin with attachments (buffers) and R2 links
    const hrEmail =
      process.env.HR_EMAIL ||
      process.env.CONTACT_RECEIVER ||
      process.env.CAREERS_RECEIVER;

    if (hrEmail && looksLikeEmail(hrEmail)) {
      try {
        const answersHtml = customAnswers && customAnswers.length
          ? `<h3>Answers</h3><ul>${customAnswers.map(a => `<li><strong>${escapeHtml(a.questionText || "Question")}:</strong> ${escapeHtml(a.answer)}</li>`).join("")}</ul>`
          : "";

        const filesHtml = uploaded.map(u => `<li><a href="${u.url}" target="_blank">${escapeHtml(u.originalName)}</a> (${Math.round((u.size || 0) / 1024)} KB)</li>`).join("");
        const hrHtml = `<p>New application for <strong>${escapeHtml(job.title)}</strong></p>
                        <ul>
                          <li><strong>Name:</strong> ${escapeHtml(application.fullName)}</li>
                          <li><strong>Email:</strong> ${escapeHtml(application.email)}</li>
                          <li><strong>Phone:</strong> ${escapeHtml(application.phone || "-")}</li>
                          <li><strong>Applied At:</strong> ${new Date(application.createdAt).toISOString()}</li>
                          <li><strong>Files:</strong><ul>${filesHtml}</ul></li>
                        </ul>
                        <p><strong>Cover Letter:</strong></p>
                        <pre style="white-space:pre-wrap;">${escapeHtml(application.coverLetter || "(none)")}</pre>
                        ${answersHtml}
                        <p>Application ID: ${application._id}</p>`;

        // prepare attachments from buffers where available
        const attachments = uploaded
          .filter((u) => u.buffer)
          .map((u) => ({ filename: u.originalName || "file", content: u.buffer, contentType: u.mimetype }));

        if (typeof sendEmail === "function") {
          await sendEmail({
            to: hrEmail,
            subject: `New Application — ${job.title} (${application.fullName})`,
            html: hrHtml,
            text: `New application for ${job.title} from ${application.fullName}. Files: ${uploaded.map(u => u.url).join(", ")}`,
            attachments: attachments.length ? attachments : undefined,
          });
          logger.info(`HR notification sent to ${hrEmail} for application ${application._id}`);
        } else {
          logger.warn("sendEmail not available - HR notification skipped (logging only)");
          logger.info(`[LOG-ONLY HR NOTIFY] ${hrEmail} | ${uploaded.map(u => u.url).join(", ")}`);
        }
      } catch (hrErr) {
        logger.warn(`Failed to send HR notification: ${hrErr?.message ?? hrErr}`);
      }
    } else {
      logger.warn("HR_EMAIL not configured or invalid; skipping HR notification");
    }

    logger.info(`Application created: ${application._id} for job ${job.title}`);
    const out = application.toObject ? application.toObject() : application;
    return res.status(201).json({ success: true, data: out, message: "Application submitted" });
  } catch (err) {
    // Duplicate key (e.g. unique constraint)
    if (err && err.code === 11000) {
      logger.warn(`Duplicate application prevented: ${JSON.stringify(err.keyValue)}`);
      return res.status(409).json({ success: false, code: "DUPLICATE_APPLICATION", message: "You have already applied for this job with this email." });
    }
    logger.error(`applyForJob failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "APPLICATION_ERROR", message: "Failed to submit application" });
  }
};

/* --------------------------- Admin: applications --------------------------- */

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

    logger.info(`getAllApplications: returned ${applications.length} / ${total}`);
    return res.status(200).json({ success: true, data: applications, meta: { page: pageNum, limit: perPage, total } });
  } catch (err) {
    logger.error(`getAllApplications failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "APPLICATION_FETCH_ERROR", message: "Failed to fetch applications" });
  }
};

export const getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate("job", "title location department type").lean();
    if (!app) {
      logger.warn(`getApplication: not found (${req.params.id})`);
      return res.status(404).json({ success: false, code: "APPLICATION_NOT_FOUND", message: "Application not found" });
    }
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`getApplication failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "APPLICATION_FETCH_ERROR", message: "Failed to fetch application" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, notifyCandidate } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) {
      logger.warn(`updateApplicationStatus: not found (${req.params.id})`);
      return res.status(404).json({ success: false, code: "APPLICATION_NOT_FOUND", message: "Application not found" });
    }

    if (status) app.status = status;
    if (notes !== undefined) app.notes = String(notes);
    await app.save();

    if (notifyCandidate && app.email) {
      (async () => {
        try {
          if (typeof sendEmail === "function") {
            await sendEmail({
              to: app.email,
              subject: `Application Update — ${app.status}`,
              html: `<p>Hi ${escapeHtml(app.fullName)},</p>
                     <p>Your application status has been updated to <strong>${escapeHtml(app.status)}</strong>.</p>
                     ${app.notes ? `<p>Notes: ${escapeHtml(app.notes)}</p>` : ""}<p>Regards,<br/>Fahari Yoghurt &amp; Dairies</p>`,
              text: `Hi ${app.fullName},\n\nYour application status has been updated to ${app.status}.\n\n${app.notes ? `Notes: ${app.notes}\n\n` : ""}Regards,\nFahari Yoghurt & Dairies`,
            });
            logger.info(`Notified candidate ${app.email} about status ${app.status}`);
          } else {
            logger.warn("sendEmail not available - candidate notification skipped (logging only)");
          }
        } catch (errNotify) {
          logger.warn(`Failed to notify candidate ${app.email}: ${errNotify?.message ?? errNotify}`);
        }
      })();
    }

    logger.info(`Application ${app._id} updated to ${app.status} by ${req.user?.email ?? "system"}`);
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`updateApplicationStatus failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "APPLICATION_UPDATE_ERROR", message: "Failed to update application" });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) {
      logger.warn(`deleteApplication: not found (${req.params.id})`);
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
    logger.error(`deleteApplication failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "APPLICATION_DELETE_ERROR", message: "Failed to delete application" });
  }
};

/* --------------------------- Quick Counts --------------------------- */

export const applicationsCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({});
    return res.status(200).json({ success: true, count });
  } catch (err) {
    logger.error(`applicationsCount failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "COUNT_ERROR", message: "Failed to count applications" });
  }
};

export const jobsCount = async (req, res) => {
  try {
    const count = await Job.countDocuments({});
    return res.status(200).json({ success: true, count });
  } catch (err) {
    logger.error(`jobsCount failed: ${err?.message ?? err}`, { stack: err?.stack });
    return res.status(500).json({ success: false, code: "COUNT_ERROR", message: "Failed to count jobs" });
  }
};

/* --------------------------- default export for compatibility --------------------------- */
export default {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  applicationsCount,
  jobsCount,
};
