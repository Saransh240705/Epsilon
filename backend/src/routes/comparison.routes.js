import express from "express";
import multer from "multer";
import { comparisonController } from "../controllers/comparison.controller.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  },
});

/**
 * POST /api/comparison/documents
 * Compare two brand kit documents
 */
router.post(
  "/documents",
  upload.fields([
    { name: "brandKit1", maxCount: 1 },
    { name: "brandKit2", maxCount: 1 },
  ]),
  comparisonController.compareBrandKitFiles,
);

export default router;
