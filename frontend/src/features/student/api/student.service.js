import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const studentService = {
  // --- Student Actions (For the currently logged-in user) ---

  /**
   * Creates the initial profile.
   * Backend uses the token to identify the user, so we only pass profile data.
   */
  createProfile: async (profileData) => {
    return unwrapData(await api.post("/student/create", profileData));
  },

  /**
   * Gets the current user's profile.
   */
  getProfile: async () => {
    return unwrapData(await api.get("/student/me"));
  },

  /**
   * Updates specific fields of the profile.
   */
  updateProfile: async (updateData) => {
    return unwrapData(await api.patch("/student/update", updateData));
  },

  // --- Admin Actions (Protected by Authorize Middleware) ---

  getAllProfiles: async (filters = {}) => {
    return unwrapData(await api.get("/student/all", { params: filters }));
  },

  getProfileById: async (profileCode) => {
    return unwrapData(await api.get(`/student/${profileCode}`));
  },

  updateProfileById: async (profileCode, updateData) => {
    return unwrapData(
      await api.patch("/student/update", { profileCode, ...updateData })
    );
  },

  deleteProfileById: async (profileCode) => {
    return unwrapData(await api.delete(`/student/${profileCode}`));
  },
};
