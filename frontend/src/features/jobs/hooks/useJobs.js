import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/features/jobs/api/jobs.service.js";
import { toast } from "sonner";

/**
 * Hook to fetch all jobs with optional filters
 * Accessible by: STUDENT, ADMIN, SUPER_ADMIN
 */
export const useAllJobs = (filters = {}) => {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobsService.getAllJobs(filters),
    staleTime: 60 * 1000,
  });
};

/**
 * Hook to fetch a single job by jobCode.
 * Accessible by: STUDENT, ADMIN, SUPER_ADMIN
 */
export const useJobById = (jobId) => {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => jobsService.getJobById(jobId),
    enabled: !!jobId,
  });
};

/**
 * Hook for Admin Job Operations (Create, Update, Delete)
 * Accessible by: ADMIN, SUPER_ADMIN
 */
export const useJobMutations = () => {
  const queryClient = useQueryClient();

  const createJobMutation = useMutation({
    mutationFn: jobsService.createJob,
    onSuccess: () => {
      toast.success("Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error("Failed to create job", { description: error.message });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => jobsService.updateJob(id, data),
    onSuccess: (data, variables) => {
      toast.success("Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", variables.id] });
    },
    onError: (error) => {
      toast.error("Failed to update job", { description: error.message });
    },
  });

  const updateTimelineMutation = useMutation({
    mutationFn: ({ id, data }) => jobsService.updateDriveTimeline(id, data),
    onSuccess: (data, variables) => {
      toast.success("Drive timeline updated successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", variables.id] });
    },
    onError: (error) => {
      toast.error("Failed to update drive timeline", { description: error.message });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: jobsService.deleteJob,
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      toast.error("Failed to delete job", { description: error.message });
    },
  });

  return {
    createJob: createJobMutation.mutateAsync,
    isCreating: createJobMutation.isPending,
    
    updateJob: updateJobMutation.mutateAsync,
    isUpdating: updateJobMutation.isPending,

    updateDriveTimeline: updateTimelineMutation.mutateAsync,
    isUpdatingTimeline: updateTimelineMutation.isPending,
    
    deleteJob: deleteJobMutation.mutateAsync,
    isDeleting: deleteJobMutation.isPending,
  };
};
