// src/routes/auth.proxy.js
// Proxies all /api/auth/* requests to the Auth Service.
// No JWT verification here — auth endpoints are public.
// The auth-service handles its own token checks for protected routes like /me.

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const proxyConfig = require("../config/proxy.config");
const { handleProxyError } = require("../utils/errorHandler");
const { logProxyRequest, setInternalSecurityHeaders } = require("../utils/proxyHelpers");

const router = express.Router();

const proxy = createProxyMiddleware({
  target: proxyConfig.authService.target,
  changeOrigin: true,
  pathRewrite: {
    "^/api/auth": "",
  },
  // Timeout after 10 seconds
  proxyTimeout: 10000,
  timeout: 10000,
  // Handle upstream errors gracefully
  on: {
    error: handleProxyError("Auth Service"),
    proxyReq: (proxyReq, req) => {
      setInternalSecurityHeaders(proxyReq, req, { path: proxyReq.path });
      logProxyRequest(req, proxyConfig.authService.target, req.originalUrl);
    },
  },
});

// Mount on /api/auth — Express path prefix ensures only matching requests hit the proxy
router.use("/api/auth", proxy);

module.exports = router;
