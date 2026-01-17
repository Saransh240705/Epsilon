import { geminiService } from '../services/gemini.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const analysisController = {
  /**
   * Get analysis service status
   * GET /api/analysis/status
   */
  async getStatus(req, res) {
    return sendSuccess(res, {
      available: geminiService.isAvailable(),
      features: {
        brandAudit: geminiService.isAvailable(),
        driftAnalysis: geminiService.isAvailable(),
        comparison: geminiService.isAvailable(),
        reelGeneration: geminiService.isAvailable()
      },
      timestamp: new Date().toISOString()
    }, 'Analysis service status');
  },

  /**
   * Run a comprehensive brand analysis
   * POST /api/analysis/comprehensive
   */
  async runComprehensive(req, res, next) {
    try {
      const { brandDna, includeComparison = false, comparisonSubject = null } = req.body;

      if (!brandDna || brandDna.trim().length < 10) {
        return sendError(res, 'Brand DNA must be at least 10 characters', 400, 'VALIDATION_ERROR');
      }

      if (!geminiService.isAvailable()) {
        return sendError(res, 'AI service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      logger.info('Comprehensive analysis requested');

      // Run brand audit
      const auditResult = await geminiService.performBrandAudit(brandDna);

      // Run drift analysis
      const driftAnalysis = await geminiService.analyzeDrifts(brandDna, auditResult.drifts);

      // Optional comparison
      let comparisonResult = null;
      if (includeComparison && comparisonSubject) {
        comparisonResult = await geminiService.compareBrands(brandDna, comparisonSubject);
      }

      const result = {
        audit: {
          score: auditResult.score,
          drifts: auditResult.drifts,
          violations: auditResult.violations
        },
        analysis: {
          executiveSummary: driftAnalysis,
          driftsAnalyzed: auditResult.drifts
        },
        ...(comparisonResult && { comparison: comparisonResult }),
        meta: {
          timestamp: new Date().toISOString(),
          processingTime: '< 5s'
        }
      };

      logger.info('Comprehensive analysis completed');

      return sendSuccess(res, result, 'Comprehensive analysis completed');

    } catch (error) {
      logger.error('Comprehensive analysis failed:', error.message);
      next(error);
    }
  }
};
