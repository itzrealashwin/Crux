import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationService } from "@/features/notifications/api/notification.service.js";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getMyNotifications,
    staleTime: 60 * 1000,
  });
};

export const useNotificationByCode = (BenotificationCode) => {
  return useQuery({
    queryKey: ["notifications", notificationCode],
    queryFn: () => notificationService.getNotificationByCode(notificationCode),
    enabled: !!notificationCode,
  });
};

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: (data, notificationCode) => {
      toast.success("Notification marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", notificationCode] });
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read", { description: error.message });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read", { description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error("Failed to delete notification", { description: error.message });
    },
  });

  return {
    markAsRead: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
    deleteNotification: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};