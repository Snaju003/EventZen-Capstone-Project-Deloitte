const swaggerUi = require("swagger-ui-express");

const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "EventZen API Gateway",
    version: "1.0.0",
    description: "Central API surface for EventZen microservices.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local gateway",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Events" },
    { name: "Venues" },
    { name: "Vendors" },
    { name: "Bookings" },
    { name: "Budget" },
    { name: "Payments" },
    { name: "Notifications" },
    { name: "Monitoring" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    responses: {
      Unauthorized: {
        description: "Missing or invalid authentication token.",
      },
      Forbidden: {
        description: "Authenticated user does not have access.",
      },
      TooManyRequests: {
        description: "Rate limit exceeded.",
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "Gateway health status",
        responses: {
          200: {
            description: "Gateway is up",
          },
        },
      },
    },
    "/metrics": {
      get: {
        tags: ["Monitoring"],
        summary: "Prometheus metrics",
        responses: {
          200: {
            description: "Prometheus exposition format",
          },
        },
      },
    },
    "/api/auth/{path}": {
      get: {
        tags: ["Auth"],
        summary: "Proxy auth GET endpoints",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Auth service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
        },
      },
      post: {
        tags: ["Auth"],
        summary: "Proxy auth POST endpoints",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Auth service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
      put: {
        tags: ["Auth"],
        summary: "Proxy auth PUT endpoints",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Auth service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
        },
      },
      patch: {
        tags: ["Auth"],
        summary: "Proxy auth PATCH endpoints",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Auth service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
        },
      },
      delete: {
        tags: ["Auth"],
        summary: "Proxy auth DELETE endpoints",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Auth service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
        },
      },
    },
    "/api/events/{path}": {
      get: {
        tags: ["Events"],
        summary: "Proxy event endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Proxy event endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      put: {
        tags: ["Events"],
        summary: "Proxy event endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Proxy event endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service relative route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/venues/{path}": {
      get: {
        tags: ["Venues"],
        summary: "Proxy venue endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service venues route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/vendors/{path}": {
      get: {
        tags: ["Vendors"],
        summary: "Proxy vendor endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Event service vendors route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/bookings/{path}": {
      get: {
        tags: ["Bookings"],
        summary: "Proxy booking endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Booking service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Proxy booking endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Booking service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Bookings"],
        summary: "Proxy booking endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Booking service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/budget/{path}": {
      get: {
        tags: ["Budget"],
        summary: "Proxy budget endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Budget service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Budget"],
        summary: "Proxy budget endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Budget service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      put: {
        tags: ["Budget"],
        summary: "Proxy budget endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Budget service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      delete: {
        tags: ["Budget"],
        summary: "Proxy budget endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Budget service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/payments/{path}": {
      get: {
        tags: ["Payments"],
        summary: "Proxy payment endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Payment service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
      post: {
        tags: ["Payments"],
        summary: "Proxy payment endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Payment service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/payments/revenue/summary": {
      get: {
        tags: ["Payments"],
        summary: "Revenue summary (admin)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Revenue summary" },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/api/notifications/{path}": {
      get: {
        tags: ["Notifications"],
        summary: "Proxy notification endpoints",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Notification service route",
          },
        ],
        responses: {
          200: { description: "Proxied response" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
};

module.exports = {
  swaggerUi,
  swaggerSpec,
};
