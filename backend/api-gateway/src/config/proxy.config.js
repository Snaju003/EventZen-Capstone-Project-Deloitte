// src/config/proxy.config.js
// Central registry of upstream microservice targets.
// Each service supports multiple comma-separated URLs for load balancing.
// Example: EVENT_SERVICE_URL=http://event-1:8080,http://event-2:8080

require("dotenv").config();

/**
 * Parse a comma-separated list of URLs from an environment variable.
 * Falls back to the provided default string (which may also be comma-separated).
 */
function parseTargets(envValue, fallback) {
  const raw = envValue || fallback;
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
}

const proxyConfig = {
  authService: {
    targets: parseTargets(process.env.AUTH_SERVICE_URL, "http://localhost:3001"),
    target: (process.env.AUTH_SERVICE_URL || "http://localhost:3001").split(",")[0].trim(),
    pathPrefix: "/api/auth",
  },
  eventService: {
    targets: parseTargets(process.env.EVENT_SERVICE_URL, "http://localhost:8080"),
    target: (process.env.EVENT_SERVICE_URL || "http://localhost:8080").split(",")[0].trim(),
    pathPrefix: "/api/events",
  },
  bookingService: {
    targets: parseTargets(process.env.BOOKING_SERVICE_URL, "http://localhost:5000"),
    target: (process.env.BOOKING_SERVICE_URL || "http://localhost:5000").split(",")[0].trim(),
    pathPrefix: "/api/bookings",
  },
  budgetService: {
    targets: parseTargets(process.env.BUDGET_SERVICE_URL, "http://localhost:8081"),
    target: (process.env.BUDGET_SERVICE_URL || "http://localhost:8081").split(",")[0].trim(),
    pathPrefix: "/api/budget",
  },
  paymentService: {
    targets: parseTargets(process.env.PAYMENT_SERVICE_URL, "http://localhost:3002"),
    target: (process.env.PAYMENT_SERVICE_URL || "http://localhost:3002").split(",")[0].trim(),
    pathPrefix: "/api/payments",
  },
  notificationService: {
    targets: parseTargets(process.env.NOTIFICATION_SERVICE_URL, "http://localhost:3003"),
    target: (process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3003").split(",")[0].trim(),
    pathPrefix: "/api/notifications",
  },
};

module.exports = proxyConfig;
