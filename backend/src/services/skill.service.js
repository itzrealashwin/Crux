import Skill from "../models/skills.model.js";

class SkillService {
  async createSkill(payload) {
    return Skill.create(payload);
  }

  async listSkills(filters = {}) {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.activeOnly === "true") query.isActive = true;
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return Skill.find(query).sort({ usageCount: -1, createdAt: -1 }).lean();
  }

  async getBySkillCode(skillCode) {
    const skill = await Skill.findOne({ skillCode }).lean();
    if (!skill) throw { statusCode: 404, message: "Skill not found" };
    return skill;
  }

  async updateBySkillCode(skillCode, updateData) {
    const updated = await Skill.findOneAndUpdate(
      { skillCode },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) throw { statusCode: 404, message: "Skill not found" };
    return updated;
  }

  async deleteBySkillCode(skillCode) {
    const deleted = await Skill.findOneAndDelete({ skillCode }).lean();
    if (!deleted) throw { statusCode: 404, message: "Skill not found" };
    return deleted;
  }
}

export default new SkillService();
