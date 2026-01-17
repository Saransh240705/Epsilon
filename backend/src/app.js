import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { logger } from "./utils/logger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

// Routes
import brandRoutes from "./routes/brand.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import comparisonRoutes from "./routes/comparison.routes.js";
import reelRoutes from "./routes/reel.routes.js";
import healthRoutes from "./routes/health.routes.js";
import brandAnalysisRoutes from "./routes/brandAnalysis.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// CORS configuration - allow multiple origins
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );
}

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/comparison", comparisonRoutes);
app.use("/api/reel", reelRoutes);
app.use("/api/brand-analysis", brandAnalysisRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
