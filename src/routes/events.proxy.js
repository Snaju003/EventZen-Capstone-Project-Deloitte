const express = require("express");

const proxyConfig = require("../config/proxy.config");
const { createCacheMiddleware } = require("../middleware/cache.middleware");
const { verifyToken, verifyTokenIfPresent, authorizeRoles } = require("../middleware/jwt.middleware");
const { createServiceProxy, setGatewayIdentityHeaders } = require("../utils/proxyHelpers");

const router = express.Router();

const requireAdmin = authorizeRoles("admin");
const requireAdminOrVendor = authorizeRoles("admin", "vendor");

function applyRoleGuard(guard, req, res, next) {
  return guard(req, res, next);
}

function enforceEventRouteRoles(req, res, next) {
  const path = req.path || "/";

  if (path.startsWith("/internal/")) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }

  if (req.method === "POST" && path === "/generate-description") {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  if (req.method === "POST" && path === "/") {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  if (req.method === "PUT" && /^\/[^/]+$/.test(path)) {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/cancel$/.test(path)) {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  if (req.method === "DELETE" && /^\/[^/]+$/.test(path)) {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/(publish|reject)$/.test(path)) {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/vendors$/.test(path)) {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/vendors\/[^/]+\/approve$/.test(path)) {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  if (req.method === "DELETE" && /^\/[^/]+\/vendors\/[^/]+$/.test(path)) {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/vendor-accept$/.test(path)) {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  if (req.method === "POST" && /^\/[^/]+\/vendor-decline$/.test(path)) {
    return applyRoleGuard(requireAdminOrVendor, req, res, next);
  }

  return next();
}

function enforceVenueRouteRoles(req, res, next) {
  if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    return applyRoleGuard(requireAdmin, req, res, next);
  }

  return next();
}

function enforceVendorRouteRoles(req, res, next) {
  return applyRoleGuard(requireAdmin, req, res, next);
}

const createEventServiceProxy = (upstreamPrefix) => createServiceProxy({
  target: proxyConfig.eventService.target,
  targets: proxyConfig.eventService.targets,
  upstreamPrefix,
  serviceName: "Event Service",
  onProxyReq: (proxyReq, req) => {
    setGatewayIdentityHeaders(proxyReq, req.user, { clearWhenMissing: true });
  },
});

// Cache public GET requests for events and venues (10-second TTL)
const eventsCache = createCacheMiddleware({ ttlMs: 10_000, pathPrefix: "/api/events" });
const venuesCache = createCacheMiddleware({ ttlMs: 10_000, pathPrefix: "/api/venues" });

router.use("/api/events", verifyTokenIfPresent, enforceEventRouteRoles, eventsCache, createEventServiceProxy("/events"));
router.use("/api/venues", verifyTokenIfPresent, enforceVenueRouteRoles, venuesCache, createEventServiceProxy("/venues"));
router.use("/api/vendors", verifyToken, enforceVendorRouteRoles, createEventServiceProxy("/vendors"));

module.exports = router;
