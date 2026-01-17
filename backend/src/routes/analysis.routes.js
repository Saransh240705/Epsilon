import express from 'express';
import { analysisController } from '../controllers/analysis.controller.js';

const router = express.Router();

/**
 * GET /api/analysis/status
 * Get analysis service status
 */
router.get('/status', analysisController.getStatus);

/**
 * POST /api/analysis/comprehensive
 * Run a comprehensive brand analysis
 */
router.post('/comprehensive', analysisController.runComprehensive);

export default router;
