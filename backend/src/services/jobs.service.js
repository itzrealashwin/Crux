import Job from "../models/jobs.model.js";

class JobService {
  async createJob(payload, actorId) {
    return Job.create({ ...payload, createdBy: actorId });
  }

  async listJobs(filters = {}) {
    const {
      search,
      status,
      department,
      page = 1,
      limit = 10,
      minSalary,
    } = filters;

    const query = {};
    if (status) query.status = status;
    if (department) query["eligibility.allowedDepartments"] = department;
    if (minSalary) query.packageLPA = { $gte: Number(minSalary) };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(query),
    ]);

    

    return {
      jobs,
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getByJobCode(jobCode) {
    const job = await Job.findOne({ jobCode }).lean();
    if (!job) throw { statusCode: 404, message: "Job not found" };
    return job;
  }

  async updateByJobCode(jobCode, updateData) {
    const updated = await Job.findOneAndUpdate(
      { jobCode },
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) throw { statusCode: 404, message: "Job not found" };
    return updated;
  }

  async updateTimeline(jobCode, stageKey, timelinePatch) {
    const job = await Job.findOne({ jobCode });
    if (!job) throw { statusCode: 404, message: "Job not found" };

    const index = job.driveTimeline.findIndex((s) => s.key === stageKey);
    if (index === -1) {
      job.driveTimeline.push({ key: stageKey, ...timelinePatch });
    } else {
      const existing = job.driveTimeline[index].toObject();
      job.driveTimeline[index] = {
        ...existing,
        ...timelinePatch,
        key: stageKey,
      };
    }

    await job.save();
    return job.toObject();
  }

  async deleteByJobCode(jobCode) {
    const deleted = await Job.findOneAndDelete({ jobCode }).lean();
    if (!deleted) throw { statusCode: 404, message: "Job not found" };
    return deleted;
  }
}

export default new JobService();
