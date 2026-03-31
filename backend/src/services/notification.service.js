import Notification from "../models/notifications.model.js";

class NotificationService {
  async listMyNotifications(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getByCode(notificationCode, userId, role) {
    const query = { notificationCode };
    if (role === "STUDENT") query.userId = userId;

    const notification = await Notification.findOne(query).lean();
    if (!notification) throw { statusCode: 404, message: "Notification not found" };
    return notification;
  }

  async markRead(notificationCode, userId) {
    const updated = await Notification.findOneAndUpdate(
      { notificationCode, userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) throw { statusCode: 404, message: "Notification not found" };
    return updated;
  }

  async markAllRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return { updated: true };
  }

  async deleteByCode(notificationCode, userId, role) {
    const query = { notificationCode };
    if (role === "STUDENT") query.userId = userId;

    const deleted = await Notification.findOneAndDelete(query).lean();
    if (!deleted) throw { statusCode: 404, message: "Notification not found" };
    return deleted;
  }
}

export default new NotificationService();
