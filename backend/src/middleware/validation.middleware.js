import { z } from 'zod';
import { sendValidationError } from '../utils/response.js';

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const dataToValidate = {
        ...(schema.body && { body: req.body }),
        ...(schema.query && { query: req.query }),
        ...(schema.params && { params: req.params })
      };

      const schemaToValidate = z.object({
        ...(schema.body && { body: schema.body }),
        ...(schema.query && { query: schema.query }),
        ...(schema.params && { params: schema.params })
      });

      const result = schemaToValidate.safeParse(dataToValidate);

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return sendValidationError(res, errors);
      }

      // Attach validated data to request
      if (result.data.body) req.body = result.data.body;
      if (result.data.query) req.query = result.data.query;
      if (result.data.params) req.params = result.data.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  brandAudit: {
    body: z.object({
      brandDna: z.string().min(10, 'Brand DNA must be at least 10 characters').max(2000)
    })
  },
  
  driftAnalysis: {
    body: z.object({
      brandDna: z.string().min(10).max(2000),
      drifts: z.array(z.string()).min(1).max(10)
    })
  },

  comparison: {
    body: z.object({
      subject1: z.string().min(1, 'Subject 1 is required').max(500),
      subject2: z.string().min(1, 'Subject 2 is required').max(500)
    })
  },

  reelPrompt: {
    body: z.object({
      prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000),
      aspectRatio: z.enum(['9:16', '1:1', '16:9']).default('9:16'),
      resolution: z.enum(['720p', '1080p']).default('720p')
    })
  }
};
