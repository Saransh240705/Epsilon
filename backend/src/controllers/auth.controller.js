import { sendSuccess, sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

// Mock user database (in-memory)
const users = new Map();
const sessions = new Map();

// Add a demo user
users.set("demo@epsilon.ai", {
  id: "user_demo_001",
  email: "demo@epsilon.ai",
  password: hashPassword("demo123"),
  name: "Demo User",
  role: "admin",
  createdAt: new Date().toISOString(),
});

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export const authController = {
  /**
   * POST /api/auth/signup
   */
  async signup(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return sendError(
          res,
          "Email, password, and name are required",
          400,
          "MISSING_FIELDS",
        );
      }

      if (users.has(email)) {
        return sendError(res, "Email already registered", 400, "EMAIL_EXISTS");
      }

      const userId = `user_${Date.now()}`;
      const user = {
        id: userId,
        email,
        password: hashPassword(password),
        name,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      users.set(email, user);

      // Create session
      const token = generateToken();
      sessions.set(token, { userId, email, createdAt: Date.now() });

      logger.info("User registered", { email });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
        "Account created successfully",
      );
    } catch (error) {
      logger.error("Signup failed:", error.message);
      return sendError(res, "Signup failed", 500, "SIGNUP_ERROR");
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(
          res,
          "Email and password are required",
          400,
          "MISSING_CREDENTIALS",
        );
      }

      const user = users.get(email);
      if (!user || user.password !== hashPassword(password)) {
        return sendError(
          res,
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS",
        );
      }

      // Create session
      const token = generateToken();
      sessions.set(token, { userId: user.id, email, createdAt: Date.now() });

      logger.info("User logged in", { email });

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
        "Login successful",
      );
    } catch (error) {
      logger.error("Login failed:", error.message);
      return sendError(res, "Login failed", 500, "LOGIN_ERROR");
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        sessions.delete(token);
      }

      return sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      logger.error("Logout failed:", error.message);
      return sendError(res, "Logout failed", 500, "LOGOUT_ERROR");
    }
  },

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return sendError(res, "No token provided", 401, "NO_TOKEN");
      }

      const token = authHeader.substring(7);
      const session = sessions.get(token);

      if (!session) {
        return sendError(res, "Invalid or expired token", 401, "INVALID_TOKEN");
      }

      const user = users.get(session.email);
      if (!user) {
        return sendError(res, "User not found", 404, "USER_NOT_FOUND");
      }

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        "User retrieved",
      );
    } catch (error) {
      logger.error("Get current user failed:", error.message);
      return sendError(res, "Failed to get user", 500, "USER_ERROR");
    }
  },
};

// Export sessions for middleware use
export { sessions, users };
