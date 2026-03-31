import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "@/features/applications/api/application.service.js";
import { toast } from "sonner";

/**
 * HOOK: Student - Apply for a Job
 */
export const useApplyForJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.applyForJob,
    onSuccess: () => {
      toast.success("Application Submitted!", {
        description: "Good luck! You can track this in your dashboard.",
      });

      queryClient.invalidateQueries({ queryKey: ["applications", "me"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error("Application Failed", {
        description: error.message || "Something went wrong.",
        duration: 2000,
      });
    },
  });
};

/**
 * HOOK: Student - Get My Applications
 */
export const useMyApplications = () => {
  return useQuery({
    queryKey: ["applications", "me"],
    queryFn: applicationService.getMyApplications,
    staleTime: 1000 * 60 * 5,
  });
};

export const useApplicationById = (appId) => {
  return useQuery({
    queryKey: ["applications", appId],
    queryFn: () => applicationService.getApplicationById(appId),
    enabled: !!appId,
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.withdrawApplication,
    onSuccess: () => {
      toast.success("Application Withdrawn");
      queryClient.invalidateQueries({ queryKey: ["applications", "me"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error("Failed to withdraw", { description: error.message });
    },
  });
};

export const useJobApplications = (jobId) => {
  return useQuery({
    queryKey: ["applications", "job", jobId],
    queryFn: () => applicationService.getJobApplications(jobId),
    enabled: !!jobId,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.updateApplicationStatus,
    onSuccess: (data, variables) => {
      toast.success("Status Updated", {
        description: `Candidate marked as ${variables.status}`,
      });

      if (variables.jobCode) {
        queryClient.invalidateQueries({ queryKey: ["applications", "job", variables.jobCode] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["applications", "job"] });
      }
      if (variables.appId || variables.applicationId) {
        queryClient.invalidateQueries({ queryKey: ["applications", variables.appId || variables.applicationId] });
      }
      queryClient.invalidateQueries({ queryKey: ["applications", "job"] });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Could not update status.",
      });
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationService.deleteApplication,
    onSuccess: () => {
      toast.success("Application deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      toast.error("Failed to delete application", { description: error.message });
    },
  });
};
