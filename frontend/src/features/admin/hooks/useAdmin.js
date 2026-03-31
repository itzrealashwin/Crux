import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/features/admin/api/admin.service.js";

export const useAdminProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: adminService.getProfile,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createProfile,
    onSuccess: (data) => {
      toast.success("Admin profile created successfully");
      queryClient.setQueryData(["admin", "profile"], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "all"] });
    },
    onError: (error) => {
      toast.error("Failed to create admin profile", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: adminService.updateProfile,
    onSuccess: (data) => {
      toast.success("Admin profile updated successfully");
      queryClient.setQueryData(["admin", "profile"], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "all"] });
    },
    onError: (error) => {
      toast.error("Failed to update admin profile", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProfile,
    onSuccess: () => {
      toast.success("Admin profile deleted successfully");
      queryClient.removeQueries({ queryKey: ["admin", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "all"] });
    },
    onError: (error) => {
      toast.error("Failed to delete admin profile", { description: error.message });
    },
  });

  return {
    ...profileQuery,
    profile: profileQuery.data,
    createProfile: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProfile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useAllAdmins = () => {
  return useQuery({
    queryKey: ["admin", "all"],
    queryFn: adminService.getAllAdmins,
  });
};

export const useAdminDashboard = () => {
  return {
    statsQuery: useQuery({
      queryKey: ["admin", "stats"],
      queryFn: adminService.getStats,
      staleTime: 5 * 60 * 1000,
    }),
    placementsQuery: useQuery({
      queryKey: ["admin", "placements"],
      queryFn: adminService.getRecentPlacements,
      staleTime: 5 * 60 * 1000,
    }),
  };
};