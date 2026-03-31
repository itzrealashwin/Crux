import { sendError } from '../utils/response.util.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err); // Log for debugging purposes (server-side only)

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(res, message, statusCode, err);
};
