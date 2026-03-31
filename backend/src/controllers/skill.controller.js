import skillService from "../services/skill.service.js";
import auditLogService from "../services/auditLog.service.js";
import { sendSuccess } from "../utils/response.util.js";
import { sanitizeForResponse } from "../utils/serialize.util.js";

export const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.body);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "SKILL_CREATE",
      targetType: "SKILL",
      targetId: skill._id,
      metadata: { skillCode: skill.skillCode },
    });

    sendSuccess(res, sanitizeForResponse(skill), "Skill created", 201);
  } catch (error) {
    next(error);
  }
};

export const getSkills = async (req, res, next) => {
  try {
    const skills = await skillService.listSkills(req.query);
    sendSuccess(res, sanitizeForResponse(skills), "Skills fetched");
  } catch (error) {
    next(error);
  }
};

export const getSkillByCode = async (req, res, next) => {
  try {
    const skill = await skillService.getBySkillCode(req.params.skillCode);
    sendSuccess(res, sanitizeForResponse(skill), "Skill fetched");
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const { skillCode, ...updateData } = req.body;
    const skill = await skillService.updateBySkillCode(skillCode, updateData);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "SKILL_UPDATE",
      targetType: "SKILL",
      targetId: skill._id,
      metadata: { skillCode: skill.skillCode },
    });

    sendSuccess(res, sanitizeForResponse(skill), "Skill updated");
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    const deleted = await skillService.deleteBySkillCode(req.params.skillCode);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "SKILL_DELETE",
      targetType: "SKILL",
      targetId: deleted._id,
      metadata: { skillCode: deleted.skillCode },
    });

    sendSuccess(res, { skillCode: deleted.skillCode }, "Skill deleted");
  } catch (error) {
    next(error);
  }
};
