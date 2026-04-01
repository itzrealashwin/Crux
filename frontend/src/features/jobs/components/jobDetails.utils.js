export const normalizeStudentSkills = (skills = []) => {
  if (!Array.isArray(skills)) return [];

  return skills
    .map((skill) => {
      if (typeof skill === "string") return skill;
      if (skill?.name) return skill.name;
      if (skill?.skillCode) return skill.skillCode;
      return null;
    })
    .filter(Boolean);
};

export const evaluateJobEligibility = (job, studentProfile) => {
  if (!job || !studentProfile) {
    return {
      eligible: false,
      breakdown: [],
      skills: { required: [], matched: [], count: 0, matchCount: 0 },
    };
  }

  const criteria = job.eligibility || {};

  const check = (name, reqValue, userValue, isMet, formatter = (v) => v) => ({
    name,
    required: formatter(reqValue),
    actual: formatter(userValue),
    isMet,
  });

  const checks = [
    check(
      "CGPA",
      criteria.minCgpa,
      studentProfile.cgpa,
      (studentProfile.cgpa ?? 0) >= (criteria.minCgpa || 0),
      (v) => (v ? Number(v).toFixed(1) : "0.0"),
    ),
    check(
      "Backlogs",
      criteria.maxBacklogs,
      studentProfile.backlogs,
      (studentProfile.backlogs ?? 0) <= (criteria.maxBacklogs ?? 99),
      (v) => (v === 0 ? "0" : v || "Any"),
    ),
    check(
      "Branch",
      criteria.allowedDepartments,
      studentProfile.department,
      !criteria.allowedDepartments?.length ||
        criteria.allowedDepartments.includes(studentProfile.department),
      (v) => (Array.isArray(v) ? v.join(", ") : v || "Any"),
    ),
    check(
      "Batch",
      criteria.targetBatch,
      studentProfile.graduationYear,
      !criteria.targetBatch?.length ||
        criteria.targetBatch.includes(studentProfile.graduationYear),
      (v) => (Array.isArray(v) ? v.join(", ") : v || "Any"),
    ),
    check(
      "10th marks",
      criteria.minXthMarks,
      studentProfile.xthMarks,
      (studentProfile.xthMarks ?? 0) >= (criteria.minXthMarks || 0),
      (v) => (v ? `${v}%` : "Any"),
    ),
    check(
      "12th marks",
      criteria.minXIIthMarks,
      studentProfile.xIIthMarks,
      (studentProfile.xIIthMarks ?? 0) >= (criteria.minXIIthMarks || 0),
      (v) => (v ? `${v}%` : "Any"),
    ),
  ];

  const missingCount = checks.filter((item) => !item.isMet).length;

  const requiredSkills = job.skillsRequired || [];
  const profileSkills = normalizeStudentSkills(studentProfile.skills || []);
  const matchedSkills = requiredSkills.filter((skill) => profileSkills.includes(skill));

  return {
    eligible: missingCount === 0,
    breakdown: checks,
    skills: {
      required: requiredSkills,
      matched: matchedSkills,
      count: requiredSkills.length,
      matchCount: matchedSkills.length,
    },
  };
};

export const formatDeadlineInfo = (dateString) => {
  if (!dateString) return { text: "No deadline", isUrgent: false };

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return { text: "No deadline", isUrgent: false };

  const today = new Date();
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: "Closed", isUrgent: false };
  if (diffDays === 0) return { text: "Closes today", isUrgent: true };

  return {
    text: `Closes in ${diffDays} days - ${date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`,
    isUrgent: diffDays <= 3,
  };
};

export const formatSalaryText = (job) => {
  if (job?.type?.includes("Intern")) {
    const amount = job?.stipend?.amount;
    if (!amount) return "Unpaid";
    return `${(amount / 1000).toFixed(0)}k/${job?.stipend?.frequency === "Monthly" ? "mo" : "total"}`;
  }

  return job?.packageLPA ? `${job.packageLPA} LPA` : "Not disclosed";
};
