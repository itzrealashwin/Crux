import { sanitizeForResponse } from "./serialize.util.js";

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: sanitizeForResponse(data)
  });
};

export const sendError = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV !== 'production') {
    response.error = error.message || error;
    response.stack = error.stack;
  }

  return res.status(statusCode).json(response);
};
