const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const proxyConfig = require("../config/proxy.config");
const { verifyToken, authorizeRoles } = require("../middleware/jwt.middleware");
const { createServiceProxy, setGatewayIdentityHeaders } = require("../utils/proxyHelpers");
const { handleProxyError } = require("../utils/errorHandler");

const router = express.Router();
const requireCustomer = authorizeRoles("customer");
const requireAdmin = authorizeRoles("admin");

const createPaymentsProxy = (pathPrefix) => createServiceProxy({
  target: proxyConfig.paymentService.target,
  targets: proxyConfig.paymentService.targets,
  upstreamPrefix: pathPrefix,
  serviceName: "Payment Service",
  onProxyReq: (proxyReq, req) => {
    setGatewayIdentityHeaders(proxyReq, req.user);
  },
});

const revenueSummaryProxy = createProxyMiddleware({
  target: proxyConfig.paymentService.target,
  changeOrigin: true,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: () => "/payments/revenue/summary",
  on: {
    error: handleProxyError("Payment Service"),
    proxyReq: (proxyReq, req) => {
      setGatewayIdentityHeaders(proxyReq, req.user);
    },
  },
});

// Admin-only revenue endpoint - must be before the general /api/payments route
router.get("/api/payments/revenue/summary", verifyToken, requireAdmin, revenueSummaryProxy);

// General payments routes for customers
router.use("/api/payments", verifyToken, requireCustomer, createPaymentsProxy("/payments"));

module.exports = router;
