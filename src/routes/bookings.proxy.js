const express = require("express");

const proxyConfig = require("../config/proxy.config");
const { verifyToken, authorizeRoles } = require("../middleware/jwt.middleware");
const { createServiceProxy, setGatewayIdentityHeaders } = require("../utils/proxyHelpers");

const router = express.Router();
const requireAdmin = authorizeRoles("admin");
const requireAdminOrVendor = authorizeRoles("admin", "vendor");

function enforceBookingRouteRoles(req, res, next) {
  const path = req.path || "/";

  // POST /check-in — vendors and admins
  if (req.method === "POST" && path === "/check-in") {
    return requireAdminOrVendor(req, res, next);
  }

  // GET /event/:id — attendees list (admin only)
  if (req.method === "GET" && /^\/event\/[^/]+$/.test(path)) {
    return requireAdmin(req, res, next);
  }

  // DELETE /:id/admin — admin cancel
  if (req.method === "DELETE" && /^\/[^/]+\/admin$/.test(path)) {
    return requireAdmin(req, res, next);
  }

  return next();
}

const proxy = createServiceProxy({
  target: proxyConfig.bookingService.target,
  upstreamPrefix: "/bookings",
  serviceName: "Booking Service",
  onProxyReq: (proxyReq, req) => {
    setGatewayIdentityHeaders(proxyReq, req.user);
  },
});

router.use("/api/bookings", verifyToken, enforceBookingRouteRoles, proxy);

module.exports = router;
