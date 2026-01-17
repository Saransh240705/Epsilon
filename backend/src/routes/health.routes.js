import express from 'express';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', (req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      api: 'operational',
      ai: process.env.GEMINI_API_KEY ? 'operational' : 'not configured'
    }
  }, 'Epsilon Backend is running');
});

router.get('/ready', (req, res) => {
  const isReady = !!process.env.GEMINI_API_KEY;
  
  if (isReady) {
    sendSuccess(res, { ready: true }, 'All services ready');
  } else {
    res.status(503).json({
      success: false,
      error: {
        message: 'Service not fully configured',
        code: 'SERVICE_NOT_READY',
        details: { missingConfig: ['GEMINI_API_KEY'] }
      }
    });
  }
});

export default router;
