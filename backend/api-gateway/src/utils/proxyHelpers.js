const { createProxyMiddleware } = require("http-proxy-middleware");
const crypto = require("crypto");
const { handleProxyError } = require("./errorHandler");
const { RoundRobinBalancer } = require("../middleware/loadBalancer");

const IDENTITY_HEADERS = ["X-User-Id", "X-User-Role", "X-User-Email"];
const INTERNAL_HEADERS = [
  "X-Internal-Secret",
  "X-Internal-Timestamp",
  "X-Internal-Service",
  "X-Internal-Signature",
];

function createInternalSignature({ secret, timestamp, method, path, service }) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${method}.${path}.${service}`)
    .digest("hex");
}

function setInternalSecurityHeaders(proxyReq, req, { path } = {}) {
  const internalSecret = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();

  if (!internalSecret) {
    INTERNAL_HEADERS.forEach((headerName) => proxyReq.removeHeader(headerName));
    return;
  }

  const timestamp = Date.now().toString();
  const method = String(req.method || "GET").toUpperCase();
  const service = String(process.env.INTERNAL_CALLER_NAME || "api-gateway").trim() || "api-gateway";
  const signedPath = String(path || proxyReq.path || req.originalUrl || "/");
  const signature = createInternalSignature({
    secret: internalSecret,
    timestamp,
    method,
    path: signedPath,
    service,
  });

  proxyReq.setHeader("X-Internal-Secret", internalSecret);
  proxyReq.setHeader("X-Internal-Timestamp", timestamp);
  proxyReq.setHeader("X-Internal-Service", service);
  proxyReq.setHeader("X-Internal-Signature", signature);
}

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

/**
 * Create an http-proxy-middleware instance with round-robin load balancing.
 *
 * When `targets` (array) is provided, the proxy dynamically selects the
 * upstream host per-request via the `router` option. If only a single URL
 * is provided, behaviour is identical to before — no overhead added.
 */
function createServiceProxy({
  target,
  targets,
  upstreamPrefix,
  serviceName,
  onProxyReq,
}) {
  // Build a balancer when multiple targets are available
  const balancer =
    Array.isArray(targets) && targets.length > 0
      ? new RoundRobinBalancer(targets)
      : null;

  const effectiveTarget = balancer ? balancer.next() : target;

  return createProxyMiddleware({
    target: effectiveTarget,
    changeOrigin: true,
    proxyTimeout: 10000,
    timeout: 10000,
    pathRewrite: (path) => `${upstreamPrefix}${path === "/" ? "" : path}`,

    // Dynamic target selection via router (called per-request)
    ...(balancer
      ? {
          router: () => balancer.next(),
        }
      : {}),

    on: {
      error: (err, req, res) => {
        // Mark the target as unhealthy when the proxy fails
        if (balancer && req._proxyTarget) {
          balancer.markUnhealthy(req._proxyTarget);
          console.warn(`[LB] Marked ${req._proxyTarget} as unhealthy for ${serviceName}`);
        }
        handleProxyError(serviceName)(err, req, res);
      },
      proxyReq: (proxyReq, req) => {
        // Capture the actual target for error-handling
        if (balancer) {
          req._proxyTarget = `${proxyReq.protocol}//${proxyReq.host}`;
        }
        setInternalSecurityHeaders(proxyReq, req, { path: proxyReq.path });
        onProxyReq?.(proxyReq, req);
        logProxyRequest(req, effectiveTarget, proxyReq.path);
      },
    },
  });
}

module.exports = {
  createServiceProxy,
  logProxyRequest,
  setGatewayIdentityHeaders,
  setInternalSecurityHeaders,
};
