import { geminiService } from '../services/gemini.service.js';
import { videoService } from '../services/video.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const reelController = {
  /**
   * Enhance a prompt for video generation
   * POST /api/reel/enhance-prompt
   */
  async enhancePrompt(req, res, next) {
    try {
      const { prompt } = req.body;

      if (!prompt || prompt.trim().length < 10) {
        return sendError(res, 'Prompt must be at least 10 characters', 400, 'VALIDATION_ERROR');
      }

      logger.info('Prompt enhancement requested', { promptLength: prompt.length });

      if (!geminiService.isAvailable()) {
        return sendError(res, 'AI service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      const enhancedPrompt = await geminiService.enhanceReelPrompt(prompt);

      logger.info('Prompt enhanced successfully');

      return sendSuccess(res, {
        original: prompt,
        enhanced: enhancedPrompt,
        timestamp: new Date().toISOString()
      }, 'Prompt enhanced successfully');

    } catch (error) {
      logger.error('Prompt enhancement failed:', error.message);
      next(error);
    }
  },

  /**
   * Generate a video reel
   * POST /api/reel/generate
   */
  async generateReel(req, res, next) {
    try {
      const { prompt, aspectRatio, resolution } = req.body;

      logger.info('Reel generation requested', { aspectRatio, resolution });

      if (!videoService.isAvailable()) {
        return sendError(res, 'Video service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      // First enhance the prompt
      let finalPrompt = prompt;
      if (geminiService.isAvailable()) {
        try {
          finalPrompt = await geminiService.enhanceReelPrompt(prompt);
        } catch (e) {
          logger.warn('Prompt enhancement failed, using original:', e.message);
        }
      }

      // Generate video
      const result = await videoService.generateVideo(finalPrompt, {
        aspectRatio,
        resolution
      });

      logger.info('Reel generation initiated', { operationId: result.operationId });

      return sendSuccess(res, {
        ...result,
        originalPrompt: prompt,
        enhancedPrompt: finalPrompt
      }, 'Video generation initiated');

    } catch (error) {
      logger.error('Reel generation failed:', error.message);
      next(error);
    }
  },

  /**
   * Check video generation status
   * GET /api/reel/status/:operationId
   */
  async checkStatus(req, res, next) {
    try {
      const { operationId } = req.params;

      logger.debug('Status check requested', { operationId });

      const status = await videoService.checkOperationStatus(operationId);

      return sendSuccess(res, status, 'Status retrieved');

    } catch (error) {
      logger.error('Status check failed:', error.message);
      next(error);
    }
  }
};
