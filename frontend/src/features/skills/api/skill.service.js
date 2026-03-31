import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const skillService = {
  getAllSkills: async (filters = {}) => unwrapData(await api.get("/skills", { params: filters })),

  getSkillByCode: async (skillCode) => unwrapData(await api.get(`/skills/${skillCode}`)),

  createSkill: async (payload) => unwrapData(await api.post("/skills/create", payload)),

  updateSkill: async (skillCode, payload = {}) =>
    unwrapData(await api.patch("/skills/update", { skillCode, ...payload })),

  deleteSkill: async (skillCode) => unwrapData(await api.delete(`/skills/${skillCode}`)),
};