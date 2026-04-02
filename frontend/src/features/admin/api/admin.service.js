import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const adminService = {
	createProfile: async (payload) => unwrapData(await api.post("/admin/profile", payload)),

	getProfile: async () => unwrapData(await api.get("/admin/profile")),

	updateProfile: async (payload) => unwrapData(await api.put("/admin/profile", payload)),

	deleteProfile: async (id) => unwrapData(await api.delete(`/admin/profile/${id}`)),

	getAllAdmins: async () => unwrapData(await api.get("/admin/all")),

	getStats: async () => unwrapData(await api.get("/admin/analytics/stats")),

	getRecentPlacements: async () => unwrapData(await api.get("/admin/placements/recent")),
};
