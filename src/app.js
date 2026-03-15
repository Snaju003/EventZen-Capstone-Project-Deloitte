// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authProxy = require("./routes/auth.proxy");
const { globalErrorHandler, notFoundHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients and same-origin requests that do not send Origin.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ── Health check ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Gateway is running" });
});

// ── Proxy routes ────────────────────────────────────────────────
// Auth proxy — pathFilter inside proxy config matches /api/auth/* requests
app.use(authProxy);

// Future: mount event-service and budget-service proxies here with
//   const { verifyToken } = require("./middleware/jwt.middleware");
//   app.use("/api/events", verifyToken, eventsProxy);

// ── Catch-all 404 & global error handler ────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
