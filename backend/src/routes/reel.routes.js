import express from 'express';
import { reelController } from '../controllers/reel.controller.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * POST /api/reel/enhance-prompt
 * Enhance a prompt for video generation
 */
router.post('/enhance-prompt', reelController.enhancePrompt);

/**
 * POST /api/reel/generate
 * Generate a video reel
 */
router.post('/generate', validate(schemas.reelPrompt), reelController.generateReel);

/**
 * GET /api/reel/status/:operationId
 * Check video generation status
 */
router.get('/status/:operationId', reelController.checkStatus);

export default router;
