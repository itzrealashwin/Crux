import jobService from "../services/jobs.service.js";
import auditLogService from "../services/auditLog.service.js";
import { sendSuccess } from "../utils/response.util.js";
import { sanitizeForResponse } from "../utils/serialize.util.js";

export const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body, req.user._id);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "JOB_CREATE",
      targetType: "JOB",
      targetId: job._id,
      metadata: { jobCode: job.jobCode },
    });

    sendSuccess(res, sanitizeForResponse(job), "Job created", 201);
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.listJobs(req.query);
    sendSuccess(res, sanitizeForResponse(result), "Jobs fetched");
  } catch (error) {
    next(error);
  }
};

export const getJobByCode = async (req, res, next) => {
  try {
    const job = await jobService.getByJobCode(req.params.jobCode);
    sendSuccess(res, sanitizeForResponse(job), "Job fetched");
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { jobCode, ...updateData } = req.body;
    const job = await jobService.updateByJobCode(jobCode, updateData);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "JOB_UPDATE",
      targetType: "JOB",
      targetId: job._id,
      metadata: { jobCode: job.jobCode },
    });

    sendSuccess(res, sanitizeForResponse(job), "Job updated");
  } catch (error) {
    next(error);
  }
};

export const updateDriveTimeline = async (req, res, next) => {
  try {
    const { jobCode, stageKey, ...timelinePatch } = req.body;
    const job = await jobService.updateTimeline(jobCode, stageKey, timelinePatch);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "JOB_TIMELINE_UPDATE",
      targetType: "JOB",
      targetId: job._id,
      metadata: { jobCode: job.jobCode, stageKey },
    });

    sendSuccess(res, sanitizeForResponse(job), "Drive timeline updated");
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const deleted = await jobService.deleteByJobCode(req.params.jobCode);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "JOB_DELETE",
      targetType: "JOB",
      targetId: deleted._id,
      metadata: { jobCode: deleted.jobCode },
    });

    sendSuccess(res, { jobCode: deleted.jobCode }, "Job deleted");
  } catch (error) {
    next(error);
  }
};
