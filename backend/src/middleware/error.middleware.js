import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return sendError(res, err.message, 400, 'VALIDATION_ERROR');
  }

  if (err.name === 'UnauthorizedError') {
    return sendError(res, 'Unauthorized access', 401, 'UNAUTHORIZED');
  }

  if (err.code === 'ECONNREFUSED') {
    return sendError(res, 'Service unavailable', 503, 'SERVICE_UNAVAILABLE');
  }

  // Gemini API errors
  if (err.message?.includes('API key')) {
    return sendError(res, 'AI service configuration error', 500, 'AI_CONFIG_ERROR');
  }

  if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
    return sendError(res, 'AI service rate limit exceeded', 429, 'RATE_LIMIT');
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return sendError(res, message, statusCode, err.code || 'INTERNAL_ERROR');
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND');
};
