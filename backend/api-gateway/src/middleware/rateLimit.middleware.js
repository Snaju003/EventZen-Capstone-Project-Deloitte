const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 10;

function normalizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function createRateLimiter({
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS,
  message = "Too many requests. Please try again later.",
} = {}) {
  const resolvedMaxRequests = normalizeNumber(maxRequests, DEFAULT_MAX_REQUESTS);
  const resolvedWindowMs = normalizeNumber(windowMs, DEFAULT_WINDOW_MS);
  const buckets = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, resolvedWindowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${getClientIp(req)}:${req.baseUrl || ""}:${req.path || ""}`;
    const existingBucket = buckets.get(key);

    if (!existingBucket || existingBucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + resolvedWindowMs,
      });
      return next();
    }

    existingBucket.count += 1;

    if (existingBucket.count > resolvedMaxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existingBucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        success: false,
        message,
        error: "RATE_LIMITED",
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter,
};
