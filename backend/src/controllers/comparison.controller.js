import { brandAnalysisService } from "../services/brandAnalysis.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export const comparisonController = {
  /**
   * Compare two brand kit document files
   * POST /api/comparison/documents
   */
  async compareBrandKitFiles(req, res, next) {
    try {
      const files = req.files || {};
      const brandKit1 = files.brandKit1?.[0];
      const brandKit2 = files.brandKit2?.[0];

      if (!brandKit1 || !brandKit2) {
        return sendError(
          res,
          "Both brand kit files are required",
          400,
          "MISSING_FILES",
        );
      }

      logger.info("Brand kit comparison requested", {
        file1: brandKit1.originalname,
        file1Size: brandKit1.size,
        file2: brandKit2.originalname,
        file2Size: brandKit2.size,
      });

      const result = await brandAnalysisService.compareBrandKits(
        brandKit1,
        brandKit2,
      );

      return sendSuccess(
        res,
        {
          comparison: result,
          files: {
            brandKit1: { name: brandKit1.originalname, size: brandKit1.size },
            brandKit2: { name: brandKit2.originalname, size: brandKit2.size },
          },
          timestamp: new Date().toISOString(),
        },
        "Brand kit comparison completed",
      );
    } catch (error) {
      logger.error("Brand kit comparison failed:", error.message);

      if (error.message?.includes("rate") || error.message?.includes("429")) {
        return sendError(
          res,
          "AI service rate limit exceeded",
          429,
          "RATE_LIMITED",
        );
      }

      next(error);
    }
  },
};
