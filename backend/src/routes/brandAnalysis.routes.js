import express from 'express';
import multer from 'multer';
import { brandAnalysisController } from '../controllers/brandAnalysis.controller.js';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/webp',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: PNG, JPEG, WebP, PDF`), false);
    }
  }
});

/**
 * POST /api/brand-analysis/analyze
 * Analyze design compliance against brand kit
 * Expects: designFile (image/pdf), brandKitFile (pdf/image)
 */
router.post(
  '/analyze',
  upload.fields([
    { name: 'designFile', maxCount: 1 },
    { name: 'brandKitFile', maxCount: 1 }
  ]),
  brandAnalysisController.analyzeCompliance
);

/**
 * POST /api/brand-analysis/extract-brandkit
 * Extract information from brand kit
 */
router.post(
  '/extract-brandkit',
  upload.fields([{ name: 'brandKitFile', maxCount: 1 }]),
  brandAnalysisController.extractBrandKit
);

/**
 * GET /api/brand-analysis/status
 * Get service status and supported formats
 */
router.get('/status', brandAnalysisController.getStatus);

export default router;
