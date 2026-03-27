// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authProxy = require("./routes/auth.proxy");
const eventsProxy = require("./routes/events.proxy");
const bookingsProxy = require("./routes/bookings.proxy");
const budgetProxy = require("./routes/budget.proxy");
const paymentsProxy = require("./routes/payments.proxy");
const { createRateLimiter } = require("./middleware/rateLimit.middleware");
const { verifyCsrfToken } = require("./middleware/csrf.middleware");
const { globalErrorHandler, notFoundHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

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
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

const authRateLimitWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const authRateLimitMaxAttempts = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS) || 10;
const authOtpRateLimitMaxAttempts = Number(process.env.AUTH_OTP_RATE_LIMIT_MAX_ATTEMPTS) || 5;

const loginLimiter = createRateLimiter({
  windowMs: authRateLimitWindowMs,
  maxRequests: authRateLimitMaxAttempts,
  message: "Too many login attempts. Please try again later.",
});

const otpLimiter = createRateLimiter({
  windowMs: authRateLimitWindowMs,
  maxRequests: authOtpRateLimitMaxAttempts,
  message: "Too many OTP attempts. Please wait before trying again.",
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/refresh-token", loginLimiter);
app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/verify-reset-otp", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);

app.use(verifyCsrfToken);

// ── Health check ────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Gateway is running" });
});

// ── Proxy routes ────────────────────────────────────────────────
// Auth proxy — pathFilter inside proxy config matches /api/auth/* requests
app.use(authProxy);
app.use(eventsProxy);
app.use(bookingsProxy);
app.use(budgetProxy);
app.use(paymentsProxy);

// ── Catch-all 404 & global error handler ────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});
