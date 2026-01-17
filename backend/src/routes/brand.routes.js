import express from 'express';
import { brandController } from '../controllers/brand.controller.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * POST /api/brand/audit
 * Perform a brand DNA audit
 */
router.post('/audit', validate(schemas.brandAudit), brandController.performAudit);

/**
 * POST /api/brand/analyze-drifts
 * Deep analysis of brand drifts
 */
router.post('/analyze-drifts', validate(schemas.driftAnalysis), brandController.analyzeDrifts);

export default router;
