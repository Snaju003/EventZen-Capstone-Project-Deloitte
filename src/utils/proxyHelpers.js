const { createProxyMiddleware } = require("http-proxy-middleware");
const { handleProxyError } = require("./errorHandler");

const IDENTITY_HEADERS = ["X-User-Id", "X-User-Role", "X-User-Email"];

function setGatewayIdentityHeaders(proxyReq, user, { clearWhenMissing = false } = {}) {
  const userId = user?._id || user?.sub || "";
  const userRole = user?.role || "";
  const userEmail = user?.email || "";

  if (clearWhenMissing && (!userId || !userRole)) {
    IDENTITY_HEADERS.forEach((headerName) => proxyReq.removeHeader(headerName));
    return;
  }

  proxyReq.setHeader("X-User-Id", userId);
  proxyReq.setHeader("X-User-Role", userRole);
  proxyReq.setHeader("X-User-Email", userEmail);
}

function logProxyRequest(req, target, upstreamPath) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${target}${upstreamPath}`);
}

function createServiceProxy({
  target,
  upstreamPrefix,
  serviceName,
  onProxyReq,
}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 10000,
    timeout: 10000,
    pathRewrite: (path) => `${upstreamPrefix}${path === "/" ? "" : path}`,
    on: {
      error: handleProxyError(serviceName),
      proxyReq: (proxyReq, req) => {
        onProxyReq?.(proxyReq, req);
        logProxyRequest(req, target, proxyReq.path);
      },
    },
  });
}

module.exports = {
  createServiceProxy,
  logProxyRequest,
  setGatewayIdentityHeaders,
};
