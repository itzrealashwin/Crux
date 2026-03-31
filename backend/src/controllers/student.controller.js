import studentService from "../services/student.service.js";
import auditLogService from "../services/auditLog.service.js";
import { sendSuccess } from "../utils/response.util.js";
import { sanitizeForResponse } from "../utils/serialize.util.js";

export const createProfile = async (req, res, next) => {
  try {
    const { skillCodes, ...rest } = req.body;
    const createData = { ...rest };

    if (Array.isArray(skillCodes)) {
      createData.skills = await studentService.resolveSkillIds(skillCodes);
    }

    const profile = await studentService.createProfile(req.user._id, createData);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "STUDENT_PROFILE_CREATE",
      targetType: "STUDENT_PROFILE",
      targetId: profile._id,
      metadata: { profileCode: profile.profileCode },
    });

    sendSuccess(res, sanitizeForResponse(profile), "Profile created", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getMyProfile(req.user._id);
    sendSuccess(res, sanitizeForResponse(profile), "Profile fetched");
  } catch (error) {
    next(error);
  }
};

export const getProfileByCode = async (req, res, next) => {
  try {
    const profile = await studentService.getByProfileCode(req.params.profileCode);
    sendSuccess(res, sanitizeForResponse(profile), "Profile fetched");
  } catch (error) {
    next(error);
  }
};

export const listProfiles = async (req, res, next) => {
  try {
    const profiles = await studentService.listProfiles(req.query);
    sendSuccess(res, sanitizeForResponse(profiles), "Profiles fetched");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { profileCode, skillCodes, ...rest } = req.body;
    const updateData = { ...rest };

    if (Array.isArray(skillCodes)) {
      updateData.skills = await studentService.resolveSkillIds(skillCodes);
    }

    const profile = await studentService.updateProfile({
      actorId: req.user._id,
      role: req.user.role,
      profileCode,
      updateData,
    });

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "STUDENT_PROFILE_UPDATE",
      targetType: "STUDENT_PROFILE",
      targetId: profile._id,
      metadata: { profileCode },
    });

    sendSuccess(res, sanitizeForResponse(profile), "Profile updated");
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const profile = await studentService.deleteByProfileCode({
      actorId: req.user._id,
      role: req.user.role,
      profileCode: req.params.profileCode,
    });

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "STUDENT_PROFILE_DELETE",
      targetType: "STUDENT_PROFILE",
      targetId: profile._id,
      metadata: { profileCode: profile.profileCode },
    });

    sendSuccess(res, { profileCode: profile.profileCode }, "Profile deleted");
  } catch (error) {
    next(error);
  }
};
