// src/middleware/jwt.middleware.js
// Verifies JWT tokens at the gateway level for protected routes.
// Auth routes (/api/auth) are NOT behind this middleware — they are public.

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Express middleware that validates a Bearer JWT token.
 * On success, attaches decoded payload to `req.user` and adds
 * `X-User-Id`, `X-User-Email`, and `X-User-Role` headers so
 * downstream services know who the caller is.
 */
const verifyToken = (req, res, next) => {
  // Ensure the server has a secret configured
  if (!JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "JWT_SECRET is not configured on the gateway",
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header is missing",
    });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header must use Bearer scheme",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token.trim() === "") {
    return res.status(401).json({
      success: false,
      message: "Token is missing after Bearer prefix",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded payload for downstream use
    req.user = decoded;

    // Forward identity headers to downstream services
    req.headers["x-user-id"] = decoded._id || decoded.sub;
    req.headers["x-user-email"] = decoded.email;
    req.headers["x-user-role"] = decoded.role;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Token is not yet active",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Role-based authorization middleware factory.
 * Usage: `authorizeRoles("admin", "organizer")`
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before authorization",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    return next();
  };
};

module.exports = { verifyToken, authorizeRoles };
