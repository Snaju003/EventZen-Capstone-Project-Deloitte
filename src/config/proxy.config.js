// src/config/proxy.config.js
// Central registry of upstream microservice targets.
// Add new services here as they come online.

const proxyConfig = {
  authService: {
    target: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
    pathPrefix: "/api/auth",
  },
  // eventService and budgetService will be added later
};

module.exports = proxyConfig;
