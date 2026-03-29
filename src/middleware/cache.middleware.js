/**
 * In-memory response cache middleware for Express / http-proxy-middleware.
 *
 * Caches GET responses for a configurable TTL.
 * Non-GET requests to the same path prefix automatically invalidate the cache.
 */

const DEFAULT_TTL_MS = 10_000; // 10 seconds
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * @param {object} [options]
 * @param {number} [options.ttlMs]       — cache time-to-live in milliseconds (default 10 000)
 * @param {string} [options.pathPrefix]  — only cache requests whose URL starts with this prefix
 */
function createCacheMiddleware({ ttlMs = DEFAULT_TTL_MS, pathPrefix = "" } = {}) {
  const cache = new Map();

  // Periodic cleanup of expired entries
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (entry.expiresAt <= now) {
        cache.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  timer.unref();

  return (req, res, next) => {
    // Non-GET requests invalidate cache entries that share the same path prefix
    if (req.method !== "GET") {
      if (pathPrefix) {
        for (const key of cache.keys()) {
          if (key.startsWith(pathPrefix)) {
            cache.delete(key);
          }
        }
      }
      return next();
    }

    const cacheKey = req.originalUrl || req.url;

    // Check for a valid cached response
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Content-Type", cached.contentType || "application/json");
      return res.status(cached.statusCode).send(cached.body);
    }

    // Intercept the response to cache it
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const chunks = [];

    res.write = function (chunk, ...args) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return originalWrite(chunk, ...args);
    };

    res.end = function (chunk, ...args) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));

      // Only cache successful responses
      const statusCode = res.statusCode;
      if (statusCode >= 200 && statusCode < 300) {
        const body = Buffer.concat(chunks);
        cache.set(cacheKey, {
          body,
          statusCode,
          contentType: res.getHeader("content-type") || "application/json",
          expiresAt: Date.now() + ttlMs,
        });
      }

      if (!res.headersSent) {
        res.setHeader("X-Cache", "MISS");
      }
      return originalEnd(chunk, ...args);
    };

    return next();
  };
}

module.exports = { createCacheMiddleware };
