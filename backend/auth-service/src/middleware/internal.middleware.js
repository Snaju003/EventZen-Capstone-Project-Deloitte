const crypto = require("crypto");

const replayCache = new Map();

function purgeExpiredReplayEntries(nowMs) {
  for (const [key, expiresAt] of replayCache.entries()) {
    if (expiresAt <= nowMs) {
      replayCache.delete(key);
    }
  }
}

function reject(res, statusCode, message) {
  return res.status(statusCode).json({
    message,
  });
}

function requireInternalService(req, res, next) {
  const sharedSecret = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();
  const providedSecret = String(req.headers["x-internal-secret"] || "").trim();
  const timestamp = String(req.headers["x-internal-timestamp"] || "").trim();
  const serviceName = String(req.headers["x-internal-service"] || "").trim();
  const signature = String(req.headers["x-internal-signature"] || "").trim();

  if (!sharedSecret) {
    return next();
  }

  if (!providedSecret || providedSecret !== sharedSecret) {
    return reject(res, 401, "Invalid internal service secret");
  }

  if (!timestamp || !serviceName || !signature) {
    return reject(res, 401, "Internal signature headers are required");
  }

  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) {
    return reject(res, 401, "Invalid internal signature timestamp");
  }

  const maxSkewMs = Number(process.env.INTERNAL_SIGNATURE_TTL_MS || 60_000);
  const nowMs = Date.now();

  purgeExpiredReplayEntries(nowMs);

  if (Math.abs(Date.now() - timestampMs) > maxSkewMs) {
    return reject(res, 401, "Internal signature expired");
  }

  const method = String(req.method || "GET").toUpperCase();
  const path = req.originalUrl || req.url || "/";
  const expectedSignature = crypto
    .createHmac("sha256", sharedSecret)
    .update(`${timestamp}.${method}.${path}.${serviceName}`)
    .digest("hex");

  const signaturesMatch =
    expectedSignature.length === signature.length
    && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!signaturesMatch) {
    return reject(res, 401, "Invalid internal request signature");
  }

  const replayKey = `${serviceName}:${signature}`;
  if (replayCache.has(replayKey)) {
    return reject(res, 401, "Replay request detected");
  }

  replayCache.set(replayKey, nowMs + maxSkewMs);

  return next();
}

module.exports = {
  requireInternalService,
};
