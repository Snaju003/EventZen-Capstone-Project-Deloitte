// src/config/proxy.config.js
// Central registry of upstream microservice targets.
// Add new services here as they come online.

require("dotenv").config();

const proxyConfig = {
  authService: {
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    pathPrefix: "/api/auth",
  },
  eventService: {
    target: process.env.EVENT_SERVICE_URL || "http://localhost:8080",
    pathPrefix: "/api/events",
  },
  bookingService: {
    target: process.env.BOOKING_SERVICE_URL || "http://localhost:5000",
    pathPrefix: "/api/bookings",
  },
  budgetService: {
    target: process.env.BUDGET_SERVICE_URL || "http://localhost:8081",
    pathPrefix: "/api/budget",
  },
  paymentService: {
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:3002",
    pathPrefix: "/api/payments",
  },
};

module.exports = proxyConfig;
