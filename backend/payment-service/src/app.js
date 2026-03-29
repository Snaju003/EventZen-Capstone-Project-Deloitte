const express = require("express");

const paymentRoutes = require("./routes/payments.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Payment Service is running",
  });
});

app.use(paymentRoutes);

app.use((err, req, res, next) => {
  const statusCode = Number(err?.statusCode || err?.status || 500);
  const providerMessage =
    err?.error?.description
    || err?.error?.reason
    || err?.response?.error?.description
    || err?.response?.data?.error?.description;
  const message =
    providerMessage
    || err?.message
    || (statusCode >= 500 ? "Internal server error" : "Request failed");

  return res.status(statusCode).json({
    error: message,
    statusCode,
  });
});

module.exports = app;
