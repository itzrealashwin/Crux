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
  deadline: z.string().or(z.date()),
  eligibility: z.object({
    minCgpa: z.number().optional(),
    maxBacklogs: z.number().optional(),
    targetBatch: z.array(z.number()).min(1),
    allowedDepartments: z.array(z.string()).optional(),
    minXthMarks: z.number().optional(),
    minXIIthMarks: z.number().optional(),
    minProfileCompleteness: z.number().optional(),
  }),
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
