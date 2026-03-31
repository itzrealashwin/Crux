import express from "express";
import {
  getMyNotifications,
  getNotificationByCode,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody, z } from "../middlewares/validate.middleware.js";

const router = express.Router();

const markReadSchema = z.object({
  notificationCode: z.string().min(1),
});

router.use(authenticate);

router.get("/", getMyNotifications);
router.get("/:notificationCode", getNotificationByCode);
router.patch("/read", validateBody(markReadSchema), markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/:notificationCode", deleteNotification);

export default router;
