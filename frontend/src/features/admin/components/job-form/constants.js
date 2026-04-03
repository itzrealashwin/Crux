export const JOB_TYPES = ["Full Time", "Internship", "Intern + PPO"];
export const WORK_MODES = ["On-site", "Remote", "Hybrid"];
export const GENDER_OPTIONS = ["Any", "Male", "Female", "Other"];
export const STIPEND_FREQUENCY = ["Monthly", "Lumpsum"];
export const DEPARTMENT_OPTIONS = ["MCA", "MBA", "B.Tech", "M.Tech", "BCA", "BBA"];

export const SECTIONS = [
  { id: "basic-info", label: "Basic Info" },
  { id: "financials", label: "Financials" },
  { id: "eligibility", label: "Eligibility" },
  { id: "process", label: "Process" },
];

export const STAGE_DEFINITIONS = [
  { key: "APPLICATION_OPEN", label: "Application Open", group: "Application" },
  { key: "APPLICATION_CLOSE", label: "Application Close", group: "Application" },
  { key: "SHORTLIST_RELEASED", label: "Shortlist Released", group: "Screening" },
  { key: "APTITUDE_TEST", label: "Aptitude Test", group: "Assessment" },
  { key: "CODING_ROUND", label: "Coding Round", group: "Assessment" },
  { key: "GROUP_DISCUSSION", label: "Group Discussion", group: "Interview" },
  { key: "TECHNICAL_INTERVIEW", label: "Technical Interview", group: "Interview" },
  { key: "HR_INTERVIEW", label: "HR Interview", group: "Interview" },
  { key: "OFFER_ROLLOUT", label: "Offer Rollout", group: "Result" },
  { key: "DRIVE_CLOSED", label: "Drive Closed", group: "Result" },
];

export const STAGE_GROUPS = [
  "Application",
  "Screening",
  "Assessment",
  "Interview",
  "Result",
];

export const STAGE_COLORS = {
  Application: {
    chip: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-500/20",
    chipActive: "bg-blue-500 text-white border-blue-500",
    badge: "bg-blue-500/10 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  Screening: {
    chip: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 hover:bg-violet-500/20",
    chipActive: "bg-violet-500 text-white border-violet-500",
    badge: "bg-violet-500/10 text-violet-600 border-violet-200",
    dot: "bg-violet-500",
  },
  Assessment: {
    chip: "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-500/20",
    chipActive: "bg-indigo-500 text-white border-indigo-500",
    badge: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    dot: "bg-indigo-500",
  },
  Interview: {
    chip: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-500/20",
    chipActive: "bg-amber-500 text-white border-amber-500",
    badge: "bg-amber-500/10 text-amber-600 border-amber-200",
    dot: "bg-amber-500",
  },
  Result: {
    chip: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20",
    chipActive: "bg-emerald-500 text-white border-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const INITIAL_FORM_STATE = {
  company: { name: "", website: "", logoUrl: "", about: "" },
  title: "",
  description: "",
  type: "Full Time",
  workMode: "On-site",
  location: "",
  packageLPA: 0,
  salaryBreakup: { fixed: "", variable: "" },
  stipend: { amount: "", frequency: "Monthly" },
  bond: { hasBond: false, durationYears: "", penaltyAmount: "" },
  eligibility: {
    minCgpa: "",
    maxBacklogs: "",
    targetBatch: "",
    allowedDepartments: "",
    genderAllowed: "Any",
    minXthMarks: "",
    minXIIthMarks: "",
    minProfileCompleteness: 60,
  },
  skillsRequired: "",
  selectionProcess: "",
  driveTimeline: [],
  vacancies: 1,
  deadline: "",
  attachmentUrl: "",
};
