import express from "express";
import {
  createJob,
  getJobs,
  getJobByCode,
  updateJob,
  updateDriveTimeline,
  deleteJob,
} from "../controllers/jobs.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { validateBody, z } from "../middlewares/validate.middleware.js";

const router = express.Router();

const createJobSchema = z.object({
  company: z.object({
    name: z.string().min(1),
    website: z.string().optional(),
    logoUrl: z.string().optional(),
    about: z.string().optional(),
  }),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["Full Time", "Internship", "Intern + PPO"]),
  workMode: z.enum(["On-site", "Remote", "Hybrid"]).optional(),
  location: z.string().optional(),
  packageLPA: z.number(),
  vacancies: z.number().optional(),
  salaryBreakup: z.object({
    fixed: z.number().optional(),
    variable: z.number().optional(),
  }).optional(),
  stipend: z.object({
    amount: z.number().optional(),
    frequency: z.enum(["Monthly", "Lumpsum"]).optional(),
  }).optional(),
  bond: z.object({
    hasBond: z.boolean().optional(),
    durationYears: z.number().optional(),
    penaltyAmount: z.number().optional(),
  }).optional(),
  deadline: z.string().or(z.date()),
  attachmentUrl: z.string().optional(),
  eligibility: z.object({
    minCgpa: z.number().optional(),
    maxBacklogs: z.number().optional(),
    targetBatch: z.array(z.number()).min(1),
    allowedDepartments: z.array(z.string()).optional(),
    genderAllowed: z.enum(["Any", "Male", "Female", "Other"]).optional(),
    minXthMarks: z.number().optional(),
    minXIIthMarks: z.number().optional(),
    minProfileCompleteness: z.number().optional(),
  }),
  skillsRequired: z.array(z.string()).optional(),
  selectionProcess: z.array(z.object({
    step: z.number().optional(),
    name: z.string(),
  })).optional(),
  driveTimeline: z.array(z.object({
    key: z.enum([
      "APPLICATION_OPEN",
      "APPLICATION_CLOSE",
      "SHORTLIST_RELEASED",
      "APTITUDE_TEST",
      "CODING_ROUND",
      "GROUP_DISCUSSION",
      "TECHNICAL_INTERVIEW",
      "HR_INTERVIEW",
      "OFFER_ROLLOUT",
      "DRIVE_CLOSED",
    ]),
    label: z.string().optional(),
    date: z.string().optional(),
    isDone: z.boolean().optional(),
    note: z.string().optional(),
  })).optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "HOLD"]).optional(),
});

const updateJobSchema = z.object({
  jobCode: z.string().min(1),
}).and(z.record(z.any()));

const updateTimelineSchema = z.object({
  jobCode: z.string().min(1),
  stageKey: z.string().min(1),
  label: z.string().optional(),
  date: z.string().optional(),
  isDone: z.boolean().optional(),
  note: z.string().optional(),
});

router.use(authenticate);

router.get("/", getJobs);
router.get("/:jobCode", getJobByCode);

router.post(
  "/create",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(createJobSchema),
  createJob
);

router.patch(
  "/update",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(updateJobSchema),
  updateJob
);

router.patch(
  "/timeline",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(updateTimelineSchema),
  updateDriveTimeline
);

router.delete("/:jobCode", requireRoles("ADMIN", "SUPER_ADMIN"), deleteJob);

export default router;
