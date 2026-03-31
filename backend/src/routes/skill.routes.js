import express from "express";
import {
  createSkill,
  getSkills,
  getSkillByCode,
  updateSkill,
  deleteSkill,
} from "../controllers/skill.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/role.middleware.js";
import { validateBody, z } from "../middlewares/validate.middleware.js";

const router = express.Router();

const createSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateSkillSchema = z.object({
  skillCode: z.string().min(1),
}).and(z.record(z.any()));

router.use(authenticate);

router.get("/", getSkills);
router.get("/:skillCode", getSkillByCode);
router.post("/create", requireRoles("ADMIN", "SUPER_ADMIN"), validateBody(createSkillSchema), createSkill);
router.patch("/update", requireRoles("ADMIN", "SUPER_ADMIN"), validateBody(updateSkillSchema), updateSkill);
router.delete("/:skillCode", requireRoles("ADMIN", "SUPER_ADMIN"), deleteSkill);

export default router;
