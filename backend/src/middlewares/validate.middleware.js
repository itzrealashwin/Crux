import { z } from "zod";
import { sendError } from "../utils/response.util.js";

export const validateBody = (schema) => {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
      return sendError(res, message || "Invalid request body", 400);
    }

    req.body = parsed.data;
    next();
  };
};

export { z };
