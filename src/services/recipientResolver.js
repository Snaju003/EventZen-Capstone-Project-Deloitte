const mongoose = require("mongoose");

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

  try {
    const response = await fetch(`${bookingServiceUrl}/bookings/event/${encodeURIComponent(eventId)}/users-internal`, {
      method: "GET",
      headers: {
        "X-User-Id": "notification-service",
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
