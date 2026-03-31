import Job from "../models/jobs.model.js";
import StudentProfile from "../models/studentProfile.model.js";
import { sendError } from "../utils/response.util.js";

export const autoScreening = async (req, res, next) => {
	try {
		const { jobCode } = req.body;
		const studentUserId = req.user?._id;

		if (!jobCode) {
			return sendError(res, "jobCode is required", 400);
		}

		const [job, profile] = await Promise.all([
			Job.findOne({ jobCode, status: { $in: ["OPEN", "DRAFT"] } }).lean(),
			StudentProfile.findOne({ userId: studentUserId })
				.populate("skills", "name")
				.lean(),
		]);

		if (!job) {
			return sendError(res, "Job not found", 404);
		}

		if (!profile) {
			return sendError(res, "Student profile not found", 404);
		}

		if (profile.profileCompleteness < (job.eligibility?.minProfileCompleteness || 0)) {
			return sendError(res, "Profile completeness below job requirement", 400);
		}

		const deptRules = job.eligibility?.allowedDepartments || [];
		const batchRules = job.eligibility?.targetBatch || [];

		const cgpaPass = (profile.cgpa || 0) >= (job.eligibility?.minCgpa || 0);
		const backlogPass = (profile.backlogs || 0) <= (job.eligibility?.maxBacklogs || 0);
		const departmentPass = deptRules.length === 0 || deptRules.includes(profile.department);
		const batchPass = batchRules.length === 0 || batchRules.includes(profile.graduationYear);
		const xthPass = (profile.xthMarks || 0) >= (job.eligibility?.minXthMarks || 0);
		const xIIthPass = (profile.xIIthMarks || 0) >= (job.eligibility?.minXIIthMarks || 0);

		const jobSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());
		const profileSkills = (profile.skills || []).map((s) => (s.name || "").toLowerCase());
		const skillsMatch = job.skillsRequired
			? job.skillsRequired.filter((s) => profileSkills.includes(s.toLowerCase()))
			: [];
		const skillsMissing = job.skillsRequired
			? job.skillsRequired.filter((s) => !profileSkills.includes(s.toLowerCase()))
			: [];

		const failedHard = [cgpaPass, backlogPass, departmentPass, batchPass].filter(Boolean).length;
		let autoScreeningTag = "ELIGIBLE";
		if (failedHard <= 2) {
			autoScreeningTag = "INELIGIBLE";
		} else if (!xthPass || !xIIthPass || skillsMissing.length > Math.max(0, Math.floor(jobSkills.length / 2))) {
			autoScreeningTag = "BORDERLINE";
		}

		req.autoScreening = {
			job,
			profile,
			autoScreeningTag,
			screeningDetails: {
				cgpaPass,
				backlogPass,
				departmentPass,
				batchPass,
				xthPass,
				xIIthPass,
				skillsMatch,
				skillsMissing,
			},
			eligibilitySnapshot: {
				cgpa: profile.cgpa || 0,
				backlogs: profile.backlogs || 0,
				department: profile.department,
				graduationYear: profile.graduationYear,
				xthMarks: profile.xthMarks || 0,
				xIIthMarks: profile.xIIthMarks || 0,
				resumeUrl: profile.resume?.url || "",
				isEligible: autoScreeningTag === "ELIGIBLE",
			},
		};

		next();
	} catch (error) {
		next(error);
	}
};

