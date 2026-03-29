const express = require("express");

const notificationsRoutes = require("./routes/notifications.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Notification Service is running",
  });
});

app.use(notificationsRoutes);

app.use((err, req, res, next) => {
  const statusCode = Number(err?.statusCode || err?.status || 500);
  const message = err?.message || "Internal server error";

  return res.status(statusCode).json({
    error: message,
    statusCode,
  });
});

module.exports = app;
