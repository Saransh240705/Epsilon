import { geminiService } from '../services/gemini.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const brandController = {
  /**
   * Perform a brand DNA audit
   * POST /api/brand/audit
   */
  async performAudit(req, res, next) {
    try {
      const { brandDna } = req.body;
      
      logger.info('Brand audit requested', { brandDnaLength: brandDna.length });

      if (!geminiService.isAvailable()) {
        return sendError(res, 'AI service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      const result = await geminiService.performBrandAudit(brandDna);

      logger.info('Brand audit completed', { score: result.score });

      return sendSuccess(res, {
        score: result.score,
        drifts: result.drifts,
        violations: result.violations,
        timestamp: new Date().toISOString()
      }, 'Brand audit completed successfully');

    } catch (error) {
      logger.error('Brand audit failed:', error.message);
      next(error);
    }
  },

  /**
   * Deep analysis of brand drifts
   * POST /api/brand/analyze-drifts
   */
  async analyzeDrifts(req, res, next) {
    try {
      const { brandDna, drifts } = req.body;

      logger.info('Drift analysis requested', { driftCount: drifts.length });

      if (!geminiService.isAvailable()) {
        return sendError(res, 'AI service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      const analysis = await geminiService.analyzeDrifts(brandDna, drifts);

      logger.info('Drift analysis completed');

      return sendSuccess(res, {
        analysis,
        driftsAnalyzed: drifts,
        timestamp: new Date().toISOString()
      }, 'Drift analysis completed');

    } catch (error) {
      logger.error('Drift analysis failed:', error.message);
      next(error);
    }
  }
};
