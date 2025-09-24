// backend/controllers/jobController.js
import Job from "../models/Job.js";
import { validationResult } from "express-validator";
import logger from "../config/logger.js";

/**
 * @desc Get all jobs (admin)
 * @route GET /api/admin/jobs
 * @access Private (Admin)
 */
export const getAllJobs = async (req, res) => {
  try {
    const { status, type, q } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;

    if (q) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex },
        { "requirements": regex },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, jobs });
  } catch (error) {
    logger.error(`Error fetching jobs: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

/**
 * @desc Get single job by ID
 * @route GET /api/admin/jobs/:id
 * @access Private (Admin)
 */
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, job });
  } catch (error) {
    logger.error(`Error fetching job: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
};

/**
 * @desc Create a new job
 * @route POST /api/admin/jobs
 * @access Private (Admin)
 */
export const createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      location,
      type,
      deadline,
      requirements = [],
      customQuestions = [],
      status = "active",
    } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      type,
      deadline,
      requirements,
      customQuestions,
      status,
    });

    logger.info(`Job created: ${job.title} by ${req.user?.email ?? "system"}`);
    res.status(201).json({ success: true, job });
  } catch (error) {
    logger.error(`Error creating job: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to create job" });
  }
};

/**
 * @desc Update job
 * @route PUT /api/admin/jobs/:id
 * @access Private (Admin)
 */
export const updateJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    logger.info(`Job updated: ${updatedJob.title} by ${req.user?.email ?? "system"}`);
    res.status(200).json({ success: true, job: updatedJob });
  } catch (error) {
    logger.error(`Error updating job: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

/**
 * @desc Close job (custom endpoint)
 * @route PATCH /api/admin/jobs/:id/close
 * @access Private (Admin)
 */
export const closeJob = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Reason is required to close a job" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    job.status = "closed";
    job.statusReason = reason;
    job.closedAt = new Date();
    await job.save();

    logger.info(`Job closed: ${job.title} by ${req.user?.email ?? "system"}`);
    res.status(200).json({ success: true, job });
  } catch (error) {
    logger.error(`Error closing job: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to close job" });
  }
};

/**
 * @desc Delete job
 * @route DELETE /api/admin/jobs/:id
 * @access Private (Admin)
 */
export const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    logger.info(`Job deleted: ${deletedJob.title} by ${req.user?.email ?? "system"}`);
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting job: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};

/**
 * @desc Count jobs (quick stat for dashboard)
 * @route GET /api/admin/jobs/count
 * @access Private (Admin)
 */
export const getJobsCount = async (req, res) => {
  try {
    const count = await Job.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    logger.error(`Error counting jobs: ${error?.message ?? error}`);
    res.status(500).json({ success: false, message: "Failed to count jobs" });
  }
};
