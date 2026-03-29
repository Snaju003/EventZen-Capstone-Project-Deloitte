const mongoose = require("mongoose");
const crypto = require("crypto");

function buildInternalHeaders({ method, path }) {
  const secret = String(process.env.INTERNAL_SERVICE_SECRET || "").trim();
  if (!secret) {
    return {};
  }

  const timestamp = Date.now().toString();
  const service = String(process.env.INTERNAL_CALLER_NAME || "notification-service").trim() || "notification-service";
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

async function getUserIdsByRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  try {
    const users = await mongoose.connection
      .collection("USERS")
      .find({ role: { $in: roles } }, { projection: { _id: 1 } })
      .toArray();

    return users
      .map((user) => String(user?._id || "").trim())
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to resolve user recipients by role:", error.message);
    return [];
  }
}

async function getBookedUserIdsForEvent(eventId) {
  if (!eventId) {
    return [];
  }

  const bookingServiceUrl = String(process.env.BOOKING_SERVICE_URL || "http://booking-service:5000").replace(/\/$/, "");
  const endpoint = `${bookingServiceUrl}/bookings/event/${encodeURIComponent(eventId)}/users-internal`;
  const endpointUrl = new URL(endpoint);
  const method = "GET";
  const path = `${endpointUrl.pathname}${endpointUrl.search}` || "/";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "X-User-Id": "notification-service",
        ...buildInternalHeaders({ method, path }),
      },
    });

    if (!response.ok) {
      return [];
    }

    const attendees = await response.json().catch(() => []);

    if (!Array.isArray(attendees)) {
      return [];
    }

    return attendees
      .map((attendee) => String(attendee?.userId || "").trim())
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to resolve booked users for cancelled event:", error.message);
    return [];
  }
}

module.exports = {
  getBookedUserIdsForEvent,
  getUserIdsByRoles,
};
