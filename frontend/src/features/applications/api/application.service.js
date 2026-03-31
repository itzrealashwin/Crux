import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const applicationService = {
  // 1. STUDENT: Apply for a job
  // POST /api/applications/apply
  applyForJob: async (jobCode) => {
    const payload = typeof jobCode === "string" ? { jobCode } : jobCode;
    return unwrapData(await api.post("/applications/apply", payload));
  },

  // 2. STUDENT: Get my application history
  // GET /api/applications/my-applications
  getMyApplications: async () => {
    return unwrapData(await api.get("/applications/mine"));
  },

  // 3. ADMIN: Get all applications for a specific job
  // GET /api/applications/job/:jobId
  getJobApplications: async (jobCode) => {
    return unwrapData(await api.get(`/applications/job/${jobCode}`));
  },

  getApplicationById: async (appId) => {
    return unwrapData(await api.get(`/applications/${appId}`));
  },

  // 4. ADMIN: Update application status (Selected/Rejected)
  // PATCH /api/applications/:id/status
  updateApplicationStatus: async ({ applicationId, appId, status, ...rest }) => {
    return unwrapData(
      await api.patch("/applications/status", {
        appId: appId || applicationId,
        status,
        ...rest,
      })
    );
  },

  withdrawApplication: async (appId) => {
    return unwrapData(await api.patch("/applications/withdraw", { appId }));
  },

  deleteApplication: async (appId) => {
    return unwrapData(await api.delete(`/applications/${appId}`));
  },

  delete: async (pathOrAppId) => {
    const value = String(pathOrAppId);
    const appId = value.includes("/") ? value.split("/").filter(Boolean).at(-1) : value;
    return applicationService.withdrawApplication(appId);
  },
};