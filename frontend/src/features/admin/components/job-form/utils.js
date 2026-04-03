import {
  DEPARTMENT_OPTIONS,
  STAGE_DEFINITIONS,
} from "@/features/admin/components/job-form/constants";

export const toDateInput = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toISOString().split("T")[0];
};

export const parseCommaList = (input) => {
  if (!input) return [];
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseNumberList = (input) => {
  return parseCommaList(input).map(Number).filter(Number.isFinite);
};

export const parseSelectionProcess = (input) => {
  if (!input) return [];

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, index) => ({
      step: index + 1,
      name,
    }));
};

export const parseOptionalNumber = (value) => {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const mapJobToForm = (job) => ({
  company: {
    name: job.company?.name || "",
    website: job.company?.website || "",
    logoUrl: job.company?.logoUrl || "",
    about: job.company?.about || "",
  },
  title: job.title || "",
  description: job.description || "",
  type: job.type || "Full Time",
  workMode: job.workMode || "On-site",
  location: job.location || "",
  packageLPA: job.packageLPA ?? 0,
  salaryBreakup: {
    fixed: job.salaryBreakup?.fixed ?? "",
    variable: job.salaryBreakup?.variable ?? "",
  },
  stipend: {
    amount: job.stipend?.amount ?? "",
    frequency: job.stipend?.frequency || "Monthly",
  },
  bond: {
    hasBond: Boolean(job.bond?.hasBond),
    durationYears: job.bond?.durationYears ?? "",
    penaltyAmount: job.bond?.penaltyAmount ?? "",
  },
  eligibility: {
    minCgpa: job.eligibility?.minCgpa ?? "",
    maxBacklogs: job.eligibility?.maxBacklogs ?? "",
    targetBatch: (job.eligibility?.targetBatch || []).join(", "),
    allowedDepartments: (job.eligibility?.allowedDepartments || []).join(", "),
    genderAllowed: job.eligibility?.genderAllowed || "Any",
    minXthMarks: job.eligibility?.minXthMarks ?? "",
    minXIIthMarks: job.eligibility?.minXIIthMarks ?? "",
    minProfileCompleteness: job.eligibility?.minProfileCompleteness ?? 60,
  },
  skillsRequired: (job.skillsRequired || []).join(", "),
  selectionProcess: (job.selectionProcess || [])
    .map((step) => step.name)
    .filter(Boolean)
    .join("\n"),
  driveTimeline: (job.driveTimeline || []).map((stage) => ({
    key: stage.key,
    label:
      stage.label ||
      STAGE_DEFINITIONS.find((definition) => definition.key === stage.key)?.label ||
      stage.key,
    date: toDateInput(stage.date),
    isDone: Boolean(stage.isDone),
    note: stage.note || "",
  })),
  vacancies: job.vacancies ?? 1,
  deadline: toDateInput(job.deadline),
  attachmentUrl: job.attachmentUrl || "",
});

export const buildPayload = (formData, status) => {
  const targetBatch = parseNumberList(formData.eligibility.targetBatch);
  const allowedDepartments = parseCommaList(formData.eligibility.allowedDepartments).filter(
    (department) => DEPARTMENT_OPTIONS.includes(department),
  );

  return {
    company: {
      name: formData.company.name.trim(),
      website: formData.company.website.trim() || undefined,
      logoUrl: formData.company.logoUrl.trim() || undefined,
      about: formData.company.about.trim() || undefined,
    },
    title: formData.title.trim(),
    description: formData.description.trim(),
    type: formData.type,
    workMode: formData.workMode,
    location: formData.location.trim() || undefined,
    packageLPA: Number(formData.packageLPA) || 0,
    salaryBreakup: {
      fixed: parseOptionalNumber(formData.salaryBreakup.fixed),
      variable: parseOptionalNumber(formData.salaryBreakup.variable),
    },
    stipend: {
      amount: parseOptionalNumber(formData.stipend.amount) || 0,
      frequency: formData.stipend.frequency,
    },
    bond: {
      hasBond: Boolean(formData.bond.hasBond),
      durationYears: parseOptionalNumber(formData.bond.durationYears),
      penaltyAmount: parseOptionalNumber(formData.bond.penaltyAmount),
    },
    eligibility: {
      minCgpa: parseOptionalNumber(formData.eligibility.minCgpa) || 0,
      maxBacklogs: parseOptionalNumber(formData.eligibility.maxBacklogs) || 0,
      targetBatch,
      allowedDepartments,
      genderAllowed: formData.eligibility.genderAllowed,
      minXthMarks: parseOptionalNumber(formData.eligibility.minXthMarks) || 0,
      minXIIthMarks: parseOptionalNumber(formData.eligibility.minXIIthMarks) || 0,
      minProfileCompleteness:
        parseOptionalNumber(formData.eligibility.minProfileCompleteness) || 60,
    },
    selectionProcess: parseSelectionProcess(formData.selectionProcess),
    driveTimeline: formData.driveTimeline.map((stage) => ({
      key: stage.key,
      label: stage.label?.trim() || undefined,
      date: stage.date || undefined,
      isDone: Boolean(stage.isDone),
      note: stage.note?.trim() || undefined,
    })),
    skillsRequired: parseCommaList(formData.skillsRequired),
    vacancies: Number(formData.vacancies) || 1,
    deadline: formData.deadline,
    attachmentUrl: formData.attachmentUrl.trim() || undefined,
    status,
  };
};
