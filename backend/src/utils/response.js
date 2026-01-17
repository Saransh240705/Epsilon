/**
 * Standard API Response Helper
 */
export const sendResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    ...(message && { message }),
    data
  };

  return res.status(statusCode).json(response);
};

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return sendResponse(res, statusCode, data, message);
};

export const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details })
    }
  };

  return res.status(statusCode).json(response);
};

export const sendValidationError = (res, errors) => {
  return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errors);
};

export const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404, 'NOT_FOUND');
};
