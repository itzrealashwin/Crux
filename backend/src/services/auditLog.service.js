import AuditLog from "../models/auditLog.model.js";

class AuditLogService {
  async logWrite({ actorId, action, targetType, targetId, metadata = {} }) {
    if (!actorId || !action || !targetType || !targetId) {
      return null;
    }

    return AuditLog.create({
      actorId,
      action,
      targetType,
      targetId,
      metadata,
    });
  }
}

export default new AuditLogService();
