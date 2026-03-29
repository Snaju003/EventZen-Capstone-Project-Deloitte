const { createHttpError } = require("../utils/httpError");
const { hasText } = require("../utils/text");
const crypto = require("crypto");

function buildInternalHeaders({ method, path }) {
  const secret = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();
  if (!secret) {
    return {};
  }

  const timestamp = Date.now().toString();
  const service = String(process.env.INTERNAL_CALLER_NAME || "payment-service").trim() || "payment-service";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${method}.${path}.${service}`)
    .digest("hex");

  return {
    "X-Internal-Secret": secret,
    "X-Internal-Timestamp": timestamp,
    "X-Internal-Service": service,
    "X-Internal-Signature": signature,
  };
}

async function fetchEventById(eventId) {
  if (!hasText(eventId)) {
    throw createHttpError(400, "eventId is required");
  }

  const baseUrl = (process.env.EVENT_SERVICE_URL || "http://localhost:8080").replace(/\/$/, "");
  const endpoint = `${baseUrl}/events/${encodeURIComponent(eventId)}`;
  const endpointUrl = new URL(endpoint);
  const method = "GET";
  const path = `${endpointUrl.pathname}${endpointUrl.search}` || "/";

  const response = await fetch(endpoint, {
    method,
    headers: buildInternalHeaders({ method, path }),
  });

  if (response.status === 404) {
    throw createHttpError(404, "Event not found");
  }

  if (response.status === 403) {
    throw createHttpError(403, "Event is not available for payment");
  }

  if (!response.ok) {
    let message = "Unable to fetch event details";
    try {
      const payload = await response.json();
      message = payload?.error || payload?.message || message;
    } catch {
      // Ignore parsing failures and fallback to default message.
    }

    throw createHttpError(502, message);
  }

  return response.json();
}

module.exports = {
  fetchEventById,
};
