function compactObject(input) {
  return Object.entries(input || {}).reduce((accumulator, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function buildRequestContext(req) {
  const forwardedForHeader = req.headers["x-forwarded-for"];
  const forwardedForValue = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader;

  const ipAddress =
    (typeof forwardedForValue === "string" && forwardedForValue.trim()
      ? forwardedForValue.split(",")[0].trim()
      : null)
    || req.ip
    || req.socket?.remoteAddress
    || "unknown";

  return compactObject({
    ipAddress,
    userAgent: req.headers["user-agent"],
    requesterId: req.user?.sub,
    requesterRole: req.user?.role,
  });
}

function logAuditEvent(eventName, details = {}) {
  const payload = compactObject({
    timestamp: new Date().toISOString(),
    service: "auth-service",
    event: eventName,
    ...details,
  });

  console.info(`[AUDIT] ${JSON.stringify(payload)}`);
}

module.exports = {
  buildRequestContext,
  logAuditEvent,
};
