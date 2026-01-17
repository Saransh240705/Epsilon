import { brandAnalysisService } from '../services/brandAnalysis.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const brandAnalysisController = {
  /**
   * Analyze design compliance against brand kit
   * POST /api/brand-analysis/analyze
   */
  async analyzeCompliance(req, res, next) {
    try {
      const { designFile, brandKitFile } = req.files || {};

      if (!designFile || !designFile[0]) {
        return sendError(res, 'Design file is required', 400, 'MISSING_DESIGN_FILE');
      }

      if (!brandKitFile || !brandKitFile[0]) {
        return sendError(res, 'Brand kit file is required', 400, 'MISSING_BRANDKIT_FILE');
      }

      const design = designFile[0];
      const brandKit = brandKitFile[0];

      logger.info('Brand compliance analysis requested', {
        designFile: design.originalname,
        designSize: design.size,
        brandKitFile: brandKit.originalname,
        brandKitSize: brandKit.size
      });

      // Validate file types
      const allowedDesignTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
      const allowedBrandKitTypes = ['application/pdf', 'image/png', 'image/jpeg'];

      if (!allowedDesignTypes.includes(design.mimetype)) {
        return sendError(res, 'Design file must be PNG, JPEG, WebP, or PDF', 400, 'INVALID_DESIGN_TYPE');
      }

      if (!allowedBrandKitTypes.includes(brandKit.mimetype)) {
        return sendError(res, 'Brand kit must be PDF, PNG, or JPEG', 400, 'INVALID_BRANDKIT_TYPE');
      }

      if (!brandAnalysisService.isAvailable()) {
        return sendError(res, 'Brand analysis service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      const analysis = await brandAnalysisService.analyzeDesignCompliance(design, brandKit);

      return sendSuccess(res, {
        analysis,
        files: {
          design: {
            name: design.originalname,
            type: design.mimetype,
            size: design.size
          },
          brandKit: {
            name: brandKit.originalname,
            type: brandKit.mimetype,
            size: brandKit.size
          }
        },
        timestamp: new Date().toISOString()
      }, 'Brand compliance analysis completed');

    } catch (error) {
      logger.error('Brand compliance analysis failed:', error.message);
      next(error);
    }
  },

  /**
   * Extract brand kit information
   * POST /api/brand-analysis/extract-brandkit
   */
  async extractBrandKit(req, res, next) {
    try {
      const { brandKitFile } = req.files || {};

      if (!brandKitFile || !brandKitFile[0]) {
        return sendError(res, 'Brand kit file is required', 400, 'MISSING_BRANDKIT_FILE');
      }

      const brandKit = brandKitFile[0];

      logger.info('Brand kit extraction requested', {
        file: brandKit.originalname,
        size: brandKit.size
      });

      if (!brandAnalysisService.isAvailable()) {
        return sendError(res, 'Brand analysis service not configured', 503, 'SERVICE_UNAVAILABLE');
      }

      const brandInfo = await brandAnalysisService.extractBrandKitInfo(brandKit);

      return sendSuccess(res, {
        brandInfo,
        file: {
          name: brandKit.originalname,
          type: brandKit.mimetype,
          size: brandKit.size
        },
        timestamp: new Date().toISOString()
      }, 'Brand kit information extracted');

    } catch (error) {
      logger.error('Brand kit extraction failed:', error.message);
      next(error);
    }
  },

  /**
   * Get service status
   * GET /api/brand-analysis/status
   */
  async getStatus(req, res) {
    return sendSuccess(res, {
      available: brandAnalysisService.isAvailable(),
      supportedDesignFormats: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
      supportedBrandKitFormats: ['application/pdf', 'image/png', 'image/jpeg'],
      maxFileSize: '10MB',
      timestamp: new Date().toISOString()
    }, 'Brand analysis service status');
  }
};
