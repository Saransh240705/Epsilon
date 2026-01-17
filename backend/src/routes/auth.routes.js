import express from "express";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new account
 */
router.post("/signup", authController.signup);

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post("/login", authController.login);

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post("/logout", authController.logout);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", authController.getCurrentUser);

export default router;
