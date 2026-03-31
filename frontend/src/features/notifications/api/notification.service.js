import { api } from "@/shared/lib/apiClient.js";
import { unwrapData } from "@/shared/api/service.utils.js";

export const notificationService = {
  getMyNotifications: async () => unwrapData(await api.get("/notifications")),

  getNotificationByCode: async (notificationCode) =>
    unwrapData(await api.get(`/notifications/${notificationCode}`)),

  markAsRead: async (notificationCode) =>
    unwrapData(await api.patch("/notifications/read", { notificationCode })),

  markAllAsRead: async () => unwrapData(await api.patch("/notifications/read-all")),

  deleteNotification: async (notificationCode) =>
    unwrapData(await api.delete(`/notifications/${notificationCode}`)),
};