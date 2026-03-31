import express from "express";
import {
  applyForJob,
  getMyApplications,
  getApplicationByCode,
  getApplicationsByJob,
  updateApplicationStatus,
  withdrawApplication,
  deleteApplication,
} from "../controllers/application.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { autoScreening } from "../middlewares/autoscreen.middleware.js";
import { validateBody, z } from "../middlewares/validate.middleware.js";

const router = express.Router();

const applySchema = z.object({
  jobCode: z.string().min(1),
});

const updateStatusSchema = z.object({
  appId: z.string().min(1),
  status: z.enum(["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "HIRED", "REJECTED", "WITHDRAWN"]),
  adminComments: z.string().optional(),
  feedbackForStudent: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const withdrawSchema = z.object({
  appId: z.string().min(1),
});

router.use(authenticate);

router.post(
  "/apply",
  requireRoles("STUDENT"),
  validateBody(applySchema),
  autoScreening,
  applyForJob
);

router.get("/mine", requireRoles("STUDENT"), getMyApplications);
router.get("/job/:jobCode", requireRoles("ADMIN", "SUPER_ADMIN"), getApplicationsByJob);
router.get("/:appId", getApplicationByCode);

router.patch(
  "/status",
  requireRoles("ADMIN", "SUPER_ADMIN"),
  validateBody(updateStatusSchema),
  updateApplicationStatus
);

router.patch(
  "/withdraw",
  requireRoles("STUDENT"),
  validateBody(withdrawSchema),
  withdrawApplication
);

router.delete("/:appId", requireRoles("ADMIN", "SUPER_ADMIN"), deleteApplication);

export default router;
