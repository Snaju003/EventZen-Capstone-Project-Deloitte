// src/middleware/jwt.middleware.js
// Verifies JWT tokens at the gateway level for protected routes.
// Auth routes (/api/auth) are NOT behind this middleware — they are public.

const jwt = require("jsonwebtoken");
const { parseCookieHeader } = require("../utils/cookieParser");

const JWT_SECRET = process.env.JWT_SECRET;
const AUTH_SERVICE_URL = (process.env.AUTH_SERVICE_URL || "").replace(/\/$/, "");
const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";

function normalizeUserPayload(userPayload) {
  if (!userPayload || typeof userPayload !== "object") {
    return null;
  }

  const normalizedId = userPayload._id || userPayload.id || userPayload.sub || null;
  return {
    ...userPayload,
    _id: normalizedId,
    sub: userPayload.sub || normalizedId,
  };
}

async function validateWithAuthService(token, cookieHeader) {
  if (!AUTH_SERVICE_URL || !token) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const endpoints = ["/api/auth/me", "/me"];

    for (const endpoint of endpoints) {
      const response = await fetch(`${AUTH_SERVICE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const payload = await response.json().catch(() => null);
      const user = normalizeUserPayload(payload?.user || payload?.data?.user || payload?.data || payload);

      if (user) {
        return user;
      }
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Express middleware that validates a Bearer JWT token.
 * On success, attaches decoded payload to `req.user`.
 * Identity headers are signed and forwarded by proxy route handlers.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const cookieToken = parseCookieHeader(req.headers.cookie)[ACCESS_TOKEN_COOKIE_NAME] || null;
  const token = bearerToken || cookieToken;

  if (!token || token.trim() === "") {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing",
    });
  }

  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = normalizeUserPayload(decoded);
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      if (error.name === "NotBeforeError") {
        return res.status(401).json({
          success: false,
          message: "Token is not yet active",
        });
      }
    }
  }

  const userFromAuthService = await validateWithAuthService(token, req.headers.cookie);
  if (userFromAuthService) {
    req.user = userFromAuthService;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Token is invalid",
  });
};

/**
 * Optional auth middleware.
 * - If no token is provided, request proceeds as anonymous.
 * - If token exists and is valid, attaches `req.user`.
 * - If token exists but is invalid/expired, returns 401.
 */
const verifyTokenIfPresent = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  const cookieToken = parseCookieHeader(req.headers.cookie)[ACCESS_TOKEN_COOKIE_NAME] || null;
  const token = bearerToken || cookieToken;

  if (!token || token.trim() === "") {
    req.user = null;
    return next();
  }

  if (JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = normalizeUserPayload(decoded);
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      if (error.name === "NotBeforeError") {
        return res.status(401).json({
          success: false,
          message: "Token is not yet active",
        });
      }
    }
  }

  const userFromAuthService = await validateWithAuthService(token, req.headers.cookie);
  if (userFromAuthService) {
    req.user = userFromAuthService;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Token is invalid",
  });
};

/**
 * Role-based authorization middleware factory.
 * Usage: `authorizeRoles("admin", "organizer")`
 */
const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before authorization",
      });
    }

    const requesterRole = String(req.user.role || "").toLowerCase();

    if (!normalizedAllowedRoles.includes(requesterRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    return next();
  };
};

module.exports = { verifyToken, verifyTokenIfPresent, authorizeRoles };
