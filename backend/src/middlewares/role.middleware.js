import { sendError } from "../utils/response.util.js";

export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, "Forbidden: insufficient privileges", 403);
    }
    next();
  };
};
