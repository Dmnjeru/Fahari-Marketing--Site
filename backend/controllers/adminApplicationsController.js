// backend/controllers/adminApplicationsController.js
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import sendEmail from "../utils/sendEmail.js";
import logger from "../config/logger.js";

/**
 * GET /api/admin/applications
 * Admin: list applications with filters (status, jobId, email) + pagination
 */
export const listApplications = async (req, res) => {
  try {
    const { status, jobId, email, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.min(200, parseInt(limit, 10) || 50);

    const q = {};
    if (status) q.status = status;
    if (jobId) q.job = jobId;
    if (email) q.email = String(email).toLowerCase();

    // allow admin to pass a text search param 'q' (search name/email/coverLetter/notes)
    if (req.query.q) {
      const regex = new RegExp(String(req.query.q).trim(), "i");
      q.$or = [
        { fullName: regex },
        { email: regex },
        { coverLetter: regex },
        { notes: regex },
      ];
    }

    const [applications, total] = await Promise.all([
      Application.find(q)
        .populate("job", "title location")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Application.countDocuments(q),
    ]);

    return res.status(200).json({
      success: true,
      data: applications,
      meta: { page: pageNum, limit: perPage, total },
    });
  } catch (err) {
    logger.error(`listApplications error: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admin/applications/:id
 * Admin: single application details
 */
export const getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate("job", "title location").lean();
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`getApplication error: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * PATCH /api/admin/applications/:id/status
 * Admin: update application status and optional notes; notify candidate if desired
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, notifyCandidate } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    if (status) app.status = status;
    if (notes !== undefined) app.notes = String(notes).trim();

    await app.save();

    // optionally send notification email to candidate
    if (notifyCandidate && app.email) {
      try {
        await sendEmail({
          to: app.email,
          subject: `Application update — ${app.status}`,
          html: `<p>Hi ${app.fullName},</p>
                 <p>Your application status has been updated to <strong>${app.status}</strong>.</p>
                 ${notes ? `<p>Notes: ${notes}</p>` : ""}
                 <p>Regards,<br/>Fahari HR</p>`,
        });
      } catch (err) {
        logger.warn(`Failed to notify candidate for app ${app._id}: ${err?.message ?? err}`);
      }
    }

    logger.info(`Application ${app._id} status updated to ${app.status} by ${req.user?.email ?? "system"}`);
    return res.status(200).json({ success: true, data: app });
  } catch (err) {
    logger.error(`updateApplicationStatus error: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET /api/admin/applications/count
 * Quick count for admin dashboard
 */
export const applicationsCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({});
    return res.status(200).json({ success: true, count });
  } catch (err) {
    logger.error(`applicationsCount error: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * DELETE /api/admin/applications/:id
 * Admin: delete an application
 */
export const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    logger.info(`Application ${app._id} deleted by ${req.user?.email ?? "system"}`);
    return res.status(200).json({ success: true, message: "Application deleted" });
  } catch (err) {
    logger.error(`deleteApplication error: ${err?.message ?? err}`);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
