import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/features/student/api/student.service.js";
import { toast } from "sonner";

/**
 * 1. useStudentProfile
 * For the Logged-in User (Me) to view/create/update their own profile.
 */
export const useStudentProfile = (options = {}) => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["student", "profile", "me"],
    queryFn: studentService.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const createMutation = useMutation({
    mutationFn: studentService.createProfile,
    onSuccess: (data) => {
        toast.success("Profile Created Successfully!", { duration: 2000 });
        queryClient.setQueryData(["student", "profile", "me"], data);
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error) => {
        toast.error("Failed to create profile", {
            description: error.message,
            duration: 2000,
        });
    },
  });

  const updateMutation = useMutation({
    mutationFn: studentService.updateProfile,
    onSuccess: (data) => {
      toast.success("Profile Updated");
      queryClient.setQueryData(["student", "profile", "me"], data);
    },
    onError: (error) => {
      toast.error("Update failed", { description: error.message, duration: 2000 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.deleteProfileById,
    onSuccess: () => {
      toast.success("Profile deleted successfully");
      queryClient.removeQueries({ queryKey: ["student", "profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["student", "profiles"] });
    },
    onError: (error) => {
      toast.error("Failed to delete profile", { description: error.message });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    
    createProfile: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteProfile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * 2. useAllStudents (Admin)
 * For Admins to view the list of students with filters.
 */
export const useAllStudents = (filters = {}) => {
  return useQuery({
    queryKey: ["student", "profiles", filters],
    queryFn: () => studentService.getAllProfiles(filters),
    staleTime: 60 * 1000,
  });
};

/**
 * 3. useStudentById (Admin)
 * Accepts profileCode for backward compatibility with existing caller names.
 */
export const useStudentById = (userId) => {
  const queryClient = useQueryClient();
  const profileCode = userId;
  const isEnabled = !!profileCode;

  const studentQuery = useQuery({
    queryKey: ["student", "profile", profileCode],
    queryFn: () => studentService.getProfileById(profileCode),
    enabled: isEnabled,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => studentService.updateProfileById(profileCode, data),
    onSuccess: (data) => {
      toast.success("Student updated successfully");
      queryClient.setQueryData(["student", "profile", profileCode], data);
      queryClient.invalidateQueries({ queryKey: ["student", "profiles"] });
    },
    onError: (error) => {
      toast.error("Failed to update student", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => studentService.deleteProfileById(profileCode),
    onSuccess: () => {
      toast.success("Student deleted successfully");
      queryClient.removeQueries({ queryKey: ["student", "profile", profileCode] });
      queryClient.invalidateQueries({ queryKey: ["student", "profiles"] });
    },
    onError: (error) => {
      toast.error("Failed to delete student", { description: error.message });
    },
  });

  return {
    ...studentQuery,
    student: studentQuery.data,
    updateStudent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteStudent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};