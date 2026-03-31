import Application from "../models/applications.model.js";
import Job from "../models/jobs.model.js";
import Notification from "../models/notifications.model.js";

const buildStatusNotification = (status) => {
  if (status === "SHORTLISTED") return "APPLICATION_SHORTLISTED";
  if (status === "REJECTED") return "APPLICATION_REJECTED";
  if (status === "SELECTED" || status === "HIRED") return "OFFER_RECEIVED";
  return "APPLICATION_STATUS_CHANGED";
};

class ApplicationService {
  async applyForJob({ jobCode, studentId, autoScreening }) {
    const job = autoScreening.job;
    const profile = autoScreening.profile;

    const existing = await Application.exists({ jobId: job._id, studentId });
    if (existing) {
      throw { statusCode: 409, message: "Already applied for this job" };
    }

    const application = await Application.create({
      jobId: job._id,
      studentId,
      studentProfileId: profile._id,
      eligibilitySnapshot: autoScreening.eligibilitySnapshot,
      autoScreeningTag: autoScreening.autoScreeningTag,
      screeningDetails: autoScreening.screeningDetails,
      status: "APPLIED",
      history: [
        {
          status: "APPLIED",
          updatedBy: studentId,
          comment: "Application submitted",
        },
      ],
    });

    return this.getByAppId(application.appId, studentId, null);
  }

  async getByAppId(appId, requesterId, role) {
    const app = await Application.findOne({ appId })
      .populate("jobId", "jobCode title company status deadline")
      .populate("studentProfileId", "profileCode firstName lastName department graduationYear")
      .lean();

    if (!app) throw { statusCode: 404, message: "Application not found" };

    if (role === "STUDENT" && String(app.studentId) !== String(requesterId)) {
      throw { statusCode: 403, message: "Not allowed to access this application" };
    }

    return app;
  }

  async getMine(studentId) {
    return Application.find({ studentId })
      .sort({ createdAt: -1 })
      .populate("jobId", "jobCode title company status deadline")
      .populate("studentProfileId", "profileCode firstName lastName department graduationYear")
      .lean();
  }

  async getByJobCode(jobCode, filters = {}) {
    const job = await Job.findOne({ jobCode }).lean();
    if (!job) throw { statusCode: 404, message: "Job not found" };

    const query = { jobId: job._id };
    if (filters.status) query.status = filters.status;
    if (filters.autoScreeningTag) query.autoScreeningTag = filters.autoScreeningTag;

    return Application.find(query)
      .sort({ createdAt: -1 })
      .populate("studentProfileId", "profileCode firstName lastName department graduationYear")
      .lean();
  }

  async updateStatus({ appId, status, actorId, adminComments, feedbackForStudent, rejectionReason }) {
    const application = await Application.findOne({ appId });
    if (!application) throw { statusCode: 404, message: "Application not found" };

    application.status = status;
    if (adminComments !== undefined) application.adminComments = adminComments;
    if (feedbackForStudent !== undefined) application.feedbackForStudent = feedbackForStudent;
    if (rejectionReason !== undefined) application.rejectionReason = rejectionReason;

    application.history.push({
      status,
      updatedBy: actorId,
      comment: adminComments || `Status changed to ${status}`,
    });

    await application.save();

    const job = await Job.findById(application.jobId).select("jobCode title company").lean();

    await Notification.create({
      userId: application.studentId,
      type: buildStatusNotification(status),
      title: `Application ${status}`,
      message: feedbackForStudent || `Your application status is now ${status}`,
      priority: ["SELECTED", "HIRED", "SHORTLISTED"].includes(status) ? "HIGH" : "NORMAL",
      link: {
        entityType: "APPLICATION",
        entityId: application._id,
        url: `/applications/${application.appId}`,
      },
    });

    return {
      ...(await this.getByAppId(appId, actorId, "ADMIN")),
      jobMeta: job,
    };
  }

  async withdraw({ appId, studentId }) {
    const application = await Application.findOne({ appId, studentId });
    if (!application) throw { statusCode: 404, message: "Application not found" };

    application.status = "WITHDRAWN";
    application.history.push({
      status: "WITHDRAWN",
      updatedBy: studentId,
      comment: "Withdrawn by student",
    });

    await application.save();
    return this.getByAppId(appId, studentId, "STUDENT");
  }

  async deleteByAppId(appId) {
    const deleted = await Application.findOneAndDelete({ appId }).lean();
    if (!deleted) throw { statusCode: 404, message: "Application not found" };
    return deleted;
  }
}

export default new ApplicationService();
