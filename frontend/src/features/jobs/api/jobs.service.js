import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const jobsService = {
  /**
   * Get all jobs (with optional filters)
   * Accessible by: STUDENT, ADMIN, SUPER_ADMIN
   */
  getAllJobs: async (filters = {}) => {
    return unwrapData(await api.get("/jobs", { params: filters }));
  },

  /**
   * Get a specific job by ID
   * Accessible by: STUDENT, ADMIN, SUPER_ADMIN
   */
  getJobById: async (id) => {
    return unwrapData(await api.get(`/jobs/${id}`));
  },

  /**
   * Create a new job
   * Accessible by: ADMIN, SUPER_ADMIN
   */
  createJob: async (jobData) => {
    return unwrapData(await api.post("/jobs/create", jobData));
  },

  /**
   * Update an existing job
   * Accessible by: ADMIN, SUPER_ADMIN
   */
  updateJob: async (id, jobData) => {
    return unwrapData(await api.patch("/jobs/update", { jobCode: id, ...jobData }));
  },

  updateDriveTimeline: async (jobCode, timelineData) => {
    return unwrapData(
      await api.patch("/jobs/timeline", { jobCode, ...timelineData })
    );
  },

  /**
   * Delete a job
   * Accessible by: ADMIN, SUPER_ADMIN
   */
  deleteJob: async (id) => {
    return unwrapData(await api.delete(`/jobs/${id}`));
  },
};
