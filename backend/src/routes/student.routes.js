import express from "express";
import {
  createProfile,
  getMyProfile,
  getProfileByCode,
  listProfiles,
  updateProfile,
  deleteProfile,
} from "../controllers/student.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { validateBody, z } from "../middlewares/validate.middleware.js";

const router = express.Router();

const createProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().min(1),
  graduationYear: z.number(),
  cgpa: z.number().optional(),
  backlogs: z.number().optional(),
  xthMarks: z.number().optional(),
  xIIthMarks: z.number().optional(),
  skillCodes: z.array(z.string()).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  links: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
    })
    .optional(),
});

const updateProfileSchema = z.object({
  profileCode: z.string().min(1),
}).and(z.record(z.any()));

router.use(authenticate);

router.post("/create", requireRoles("STUDENT"), validateBody(createProfileSchema), createProfile);
router.get("/me", requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"), getMyProfile);
router.get("/all", requireRoles("ADMIN", "SUPER_ADMIN"), listProfiles);
router.get("/:profileCode", requireRoles("ADMIN", "SUPER_ADMIN"), getProfileByCode);

router.patch(
  "/update",
  requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"),
  validateBody(updateProfileSchema),
  updateProfile
);

router.delete("/:profileCode", requireRoles("STUDENT", "ADMIN", "SUPER_ADMIN"), deleteProfile);

export default router;
