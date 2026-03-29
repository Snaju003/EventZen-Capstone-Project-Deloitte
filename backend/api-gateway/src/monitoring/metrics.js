const client = require("prom-client");

const register = new client.Registry();

register.setDefaultLabels({
  service: "api-gateway",
});

client.collectDefaultMetrics({ register });

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

function resolveRoute(req) {
  if (req.route?.path) {
    return `${req.baseUrl || ""}${req.route.path}`;
  }

  if (req.baseUrl) {
    return req.baseUrl;
  }

  if (req.path === "/metrics") {
    return "/metrics";
  }

  return "unmatched";
}

function metricsMiddleware(req, res, next) {
  const end = httpRequestDurationSeconds.startTimer();

  res.on("finish", () => {
    const labels = {
      method: req.method,
      route: resolveRoute(req),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels, 1);
    end(labels);
  });

  next();
}

async function metricsEndpoint(req, res, next) {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.status(200).send(metrics);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
};
