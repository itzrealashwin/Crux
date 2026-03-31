import applicationService from "../services/application.service.js";
import auditLogService from "../services/auditLog.service.js";
import { sendSuccess } from "../utils/response.util.js";
import { sanitizeForResponse } from "../utils/serialize.util.js";

export const applyForJob = async (req, res, next) => {
  try {
    const application = await applicationService.applyForJob({
      jobCode: req.body.jobCode,
      studentId: req.user._id,
      autoScreening: req.autoScreening,
    });

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "APPLICATION_CREATE",
      targetType: "APPLICATION",
      targetId: application._id,
      metadata: { appId: application.appId, jobCode: req.body.jobCode },
    });

    sendSuccess(res, sanitizeForResponse(application), "Application submitted", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getMine(req.user._id);
    sendSuccess(res, sanitizeForResponse(applications), "Applications fetched");
  } catch (error) {
    next(error);
  }
};

export const getApplicationByCode = async (req, res, next) => {
  try {
    const app = await applicationService.getByAppId(
      req.params.appId,
      req.user._id,
      req.user.role
    );
    sendSuccess(res, sanitizeForResponse(app), "Application fetched");
  } catch (error) {
    next(error);
  }
};

export const getApplicationsByJob = async (req, res, next) => {
  try {
    const data = await applicationService.getByJobCode(req.params.jobCode, req.query);
    sendSuccess(res, sanitizeForResponse(data), "Job applications fetched");
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { appId, status, adminComments, feedbackForStudent, rejectionReason } = req.body;
    const app = await applicationService.updateStatus({
      appId,
      status,
      actorId: req.user._id,
      adminComments,
      feedbackForStudent,
      rejectionReason,
    });

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "APPLICATION_STATUS_UPDATE",
      targetType: "APPLICATION",
      targetId: app._id,
      metadata: { appId, status },
    });

    sendSuccess(res, sanitizeForResponse(app), "Application status updated");
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req, res, next) => {
  try {
    const app = await applicationService.withdraw({
      appId: req.body.appId,
      studentId: req.user._id,
    });

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "APPLICATION_WITHDRAW",
      targetType: "APPLICATION",
      targetId: app._id,
      metadata: { appId: req.body.appId },
    });

    sendSuccess(res, sanitizeForResponse(app), "Application withdrawn");
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const deleted = await applicationService.deleteByAppId(req.params.appId);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "APPLICATION_DELETE",
      targetType: "APPLICATION",
      targetId: deleted._id,
      metadata: { appId: deleted.appId },
    });

    sendSuccess(res, { appId: deleted.appId }, "Application deleted");
  } catch (error) {
    next(error);
  }
};
