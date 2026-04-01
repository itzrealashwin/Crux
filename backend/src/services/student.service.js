import StudentProfile from "../models/studentProfile.model.js";
import Skill from "../models/skills.model.js";
import mongoose from "mongoose";

// Reusable pipeline stages for skill lookup
const SKILL_LOOKUP = [
  {
    $lookup: {
      from: "skills",
      localField: "skills",
      foreignField: "_id",
      as: "skills",
      pipeline: [
        { $project: { _id: 0, skillCode: 1, name: 1, category: 1 } }
      ],
    },
  },
];

// Reusable pipeline for user account lookup
const ACCOUNT_LOOKUP = [
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "account",
      pipeline: [
        { $project: { userId: "$_id", email: 1, _id: 0 } }
      ],
    },
  },
  {
    $unwind: {
      path: "$account",
      preserveNullAndEmptyArrays: true,
    },
  },
];

class StudentService {
  async createProfile(userId, data) {
    const exists = await StudentProfile.exists({ userId });
    if (exists) throw { statusCode: 409, message: "Profile already exists" };

    await StudentProfile.create({ userId, ...data });
    return this.getMyProfile(userId);
  }

  async getMyProfile(userId) {
    const result = await StudentProfile.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      ...ACCOUNT_LOOKUP,
      ...SKILL_LOOKUP,
    ]);

    console.log(result);
    
    if (!result.length) throw { statusCode: 404, message: "Profile not found" };
    return result[0];
  }

  async getByProfileCode(profileCode) {
    const result = await StudentProfile.aggregate([
      { $match: { profileCode } },
      ...ACCOUNT_LOOKUP,
      ...SKILL_LOOKUP,
    ]);

    if (!result.length) throw { statusCode: 404, message: "Profile not found" };
    return result[0];
  }

  async listProfiles(filters = {}) {
    const match = {};
    if (filters.department) match.department = filters.department;
    if (filters.graduationYear) match.graduationYear = Number(filters.graduationYear);
    if (filters.placementStatus) match.placementStatus = filters.placementStatus;

    return StudentProfile.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      ...SKILL_LOOKUP,
    ]);
  }

  async updateProfile({ actorId, role, profileCode, updateData }) {
    const existing = await StudentProfile.findOne({ profileCode });
    if (!existing) throw { statusCode: 404, message: "Profile not found" };

    if (role === "STUDENT" && String(existing.userId) !== String(actorId)) {
      throw { statusCode: 403, message: "Cannot update another student's profile" };
    }

    await StudentProfile.findOneAndUpdate(
      { profileCode },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Return fresh aggregated result
    return this.getByProfileCode(profileCode);
  }

  async deleteByProfileCode({ actorId, role, profileCode }) {
    const profile = await StudentProfile.findOne({ profileCode }).lean();
    if (!profile) throw { statusCode: 404, message: "Profile not found" };

    if (role === "STUDENT" && String(profile.userId) !== String(actorId)) {
      throw { statusCode: 403, message: "Cannot delete another student's profile" };
    }

    return StudentProfile.findOneAndDelete({ profileCode }).lean();
  }

  async resolveSkillIds(skillCodes = []) {
    if (!Array.isArray(skillCodes) || skillCodes.length === 0) return [];
    const skills = await Skill.find({ skillCode: { $in: skillCodes } }, "_id").lean();
    return skills.map((s) => s._id);
  }
}

export default new StudentService();