const { createHttpError } = require("../utils/httpError");
const { hasText } = require("../utils/text");

async function fetchEventById(eventId) {
  if (!hasText(eventId)) {
    throw createHttpError(400, "eventId is required");
  }

  const baseUrl = (process.env.EVENT_SERVICE_URL || "http://localhost:8080").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/events/${encodeURIComponent(eventId)}`, {
    method: "GET",
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
