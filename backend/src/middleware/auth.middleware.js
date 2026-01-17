import { sendError } from "../utils/response.js";
import { sessions, users } from "../controllers/auth.controller.js";

/**
 * Middleware to require authentication
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, "Authentication required", 401, "NO_TOKEN");
  }

  const token = authHeader.substring(7);
  const session = sessions.get(token);

  if (!session) {
    return sendError(res, "Invalid or expired token", 401, "INVALID_TOKEN");
  }

  const user = users.get(session.email);
  if (!user) {
    return sendError(res, "User not found", 401, "USER_NOT_FOUND");
  }

  // Attach user to request
  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  next();
};

/**
 * Optional auth - attaches user if token present but doesn't require it
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const session = sessions.get(token);

    if (session) {
      const user = users.get(session.email);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }
  }

  next();
};
