// src/utils/errorHandler.js
// Centralised error handling for the API gateway.

/**
 * Catches proxy-level errors (upstream down, timeouts, network failures)
 * that http-proxy-middleware emits via its `onError` callback.
 */
const handleProxyError = (serviceName) => (err, req, res) => {
  console.error(`[Proxy Error] ${serviceName} — ${err.code || err.message}`);

  // Connection refused — service is not running
  if (err.code === "ECONNREFUSED") {
    return res.status(502).json({
      success: false,
      message: `${serviceName} is unavailable. Please try again later.`,
      error: "BAD_GATEWAY",
    });
  }

  // DNS lookup failure — hostname cannot be resolved
  if (err.code === "ENOTFOUND") {
    return res.status(502).json({
      success: false,
      message: `${serviceName} host could not be resolved.`,
      error: "BAD_GATEWAY",
    });
  }

  // Upstream timed out
  if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
    return res.status(504).json({
      success: false,
      message: `${serviceName} request timed out.`,
      error: "GATEWAY_TIMEOUT",
    });
  }

  // Connection reset by upstream
  if (err.code === "ECONNRESET") {
    return res.status(502).json({
      success: false,
      message: `Connection to ${serviceName} was reset.`,
      error: "BAD_GATEWAY",
    });
  }

  // Pipe / socket errors
  if (err.code === "EPIPE" || err.code === "ERR_STREAM_WRITE_AFTER_END") {
    return res.status(502).json({
      success: false,
      message: `Connection to ${serviceName} was interrupted.`,
      error: "BAD_GATEWAY",
    });
  }

  // Fallback for any other proxy error
  return res.status(500).json({
    success: false,
    message: `An unexpected error occurred while contacting ${serviceName}.`,
    error: "INTERNAL_SERVER_ERROR",
  });
};

/**
 * Express global error-handling middleware (4-arg signature).
 * Catches anything that falls through route handlers.
 */
const globalErrorHandler = (err, req, res, _next) => {
  console.error(`[Gateway Error] ${err.stack || err.message}`);

  const status = err.status || err.statusCode || 500;

  // JSON parse errors from malformed request bodies
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON in request body",
      error: "BAD_REQUEST",
    });
  }

  // Payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
      error: "PAYLOAD_TOO_LARGE",
    });
  }

  // Express content-type mismatch
  if (err.type === "charset.unsupported") {
    return res.status(415).json({
      success: false,
      message: "Unsupported character set",
      error: "UNSUPPORTED_MEDIA_TYPE",
    });
  }

  return res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: status >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
  });
};

/**
 * Middleware for any route that doesn't match a known path.
 */
const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    error: "NOT_FOUND",
  });
};

module.exports = { handleProxyError, globalErrorHandler, notFoundHandler };
