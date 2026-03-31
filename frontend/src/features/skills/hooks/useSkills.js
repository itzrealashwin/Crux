import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { skillService } from "@/features/skills/api/skill.service.js";

export const useSkills = (filters = {}) => {
  return useQuery({
    queryKey: ["skills", filters],
    queryFn: () => skillService.getAllSkills(filters),
  });
};

export const useSkillByCode = (skillCode) => {
  return useQuery({
    queryKey: ["skills", skillCode],
    queryFn: () => skillService.getSkillByCode(skillCode),
    enabled: !!skillCode,
  });
};

export const useSkillMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: skillService.createSkill,
    onSuccess: () => {
      toast.success("Skill created successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error) => {
      toast.error("Failed to create skill", { description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ skillCode, data }) => skillService.updateSkill(skillCode, data),
    onSuccess: (data, variables) => {
      toast.success("Skill updated successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skills", variables.skillCode] });
    },
    onError: (error) => {
      toast.error("Failed to update skill", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: skillService.deleteSkill,
    onSuccess: () => {
      toast.success("Skill deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error) => {
      toast.error("Failed to delete skill", { description: error.message });
    },
  });

  return {
    createSkill: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSkill: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSkill: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};