import notificationService from "../services/notification.service.js";
import auditLogService from "../services/auditLog.service.js";
import { sendSuccess } from "../utils/response.util.js";
import { sanitizeForResponse } from "../utils/serialize.util.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.listMyNotifications(req.user._id);
    sendSuccess(res, sanitizeForResponse(notifications), "Notifications fetched");
  } catch (error) {
    next(error);
  }
};

export const getNotificationByCode = async (req, res, next) => {
  try {
    const notification = await notificationService.getByCode(
      req.params.notificationCode,
      req.user._id,
      req.user.role
    );
    sendSuccess(res, sanitizeForResponse(notification), "Notification fetched");
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const updated = await notificationService.markRead(req.body.notificationCode, req.user._id);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "NOTIFICATION_MARK_READ",
      targetType: "NOTIFICATION",
      targetId: updated._id,
      metadata: { notificationCode: updated.notificationCode },
    });

    sendSuccess(res, sanitizeForResponse(updated), "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllRead(req.user._id);

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "NOTIFICATION_MARK_ALL_READ",
      targetType: "NOTIFICATION",
      targetId: req.user._id,
      metadata: {},
    });

    sendSuccess(res, sanitizeForResponse(result), "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await notificationService.deleteByCode(
      req.params.notificationCode,
      req.user._id,
      req.user.role
    );

    await auditLogService.logWrite({
      actorId: req.user._id,
      action: "NOTIFICATION_DELETE",
      targetType: "NOTIFICATION",
      targetId: deleted._id,
      metadata: { notificationCode: deleted.notificationCode },
    });

    sendSuccess(res, { notificationCode: deleted.notificationCode }, "Notification deleted");
  } catch (error) {
    next(error);
  }
};
