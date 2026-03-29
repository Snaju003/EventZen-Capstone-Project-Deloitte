# Event Management Capstone

## Architecture Snapshot

EventZen is a backend microservices system with mixed runtimes:

- Node.js/Express services
  - API Gateway (`backend/api-gateway`) on `3000`
  - Auth Service (`backend/auth-service`) on `3001`
  - Payment Service (`backend/payment-service`) on `3002`
  - Notification Service (`backend/notification-service`) on `3003`
- Spring Boot services
  - Event Service (`backend/event-service`) on `8080`
  - Budget Service (`backend/budget-service`) on `8081`
- ASP.NET Core service
  - Booking Service (`backend/booking-service`) on `5000`

## Observability Implementation (Prometheus + Grafana)

This repository now includes end-to-end metrics instrumentation and a monitoring stack.

### 1) Service Instrumentation

- Node services (`api-gateway`, `auth-service`, `payment-service`, `notification-service`)
  - Added `prom-client`
  - Added `/metrics` endpoint
  - Added HTTP request duration histogram and request counter metrics
  - Added default process/runtime metrics

- Spring Boot services (`event-service`, `budget-service`)
  - Added `spring-boot-starter-actuator`
  - Added `micrometer-registry-prometheus`
  - Exposed `/actuator/prometheus`
  - Exposed health endpoint via actuator

- Booking service (`booking-service`)
  - Added `prometheus-net.AspNetCore`
  - Added `app.UseHttpMetrics()` middleware
  - Added `/metrics` endpoint
  - Added `/health` endpoint

### 2) Monitoring Stack

Added a dedicated monitoring setup under `monitoring/`:

- `monitoring/docker-compose.monitoring.yml`
  - Prometheus on `9090`
  - Grafana on `3100`
- `monitoring/prometheus/prometheus.yml`
  - Scrape targets for all services
- Grafana provisioning
  - Prometheus datasource auto-configured
  - Dashboard provider auto-configured
  - Starter dashboard: `EventZen Service Overview`

## Execution Plan (Implemented)

1. Review service architecture and runtime stack.
2. Instrument every backend service with Prometheus-compatible metrics endpoints.
3. Add centralized Prometheus + Grafana stack with provisioning.
4. Add a starter Grafana dashboard for availability, throughput, latency, and 5xx trends.
5. Verify builds/configs for Node, Java, and .NET services.

## Task Checklist (Completed)

- [x] Instrument Node services for `/metrics`
- [x] Enable Spring Boot actuator Prometheus endpoints
- [x] Enable ASP.NET Core Prometheus metrics
- [x] Add monitoring compose stack and Prometheus scrape config
- [x] Provision Grafana datasource and dashboard
- [x] Validate service builds and compose config
- [x] Align gateway booking default port to `5000`

## Walkthrough

### Prerequisites

- Run backend services locally (or in containers with host-exposed ports).
- Install Docker Desktop for running Prometheus + Grafana.

### Integrated Docker Compose + .env

Root `docker-compose.yml` is now the primary integrated stack:

- It reads shared values from root `.env` (Compose variable substitution).
- It wires service-to-service URLs on the Docker network (for example `http://event-service:8080`).
- It includes Prometheus and Grafana behind the `monitoring` profile.

Run core app stack:

```bash
docker compose up -d
```

Run core stack + monitoring:

```bash
docker compose --profile monitoring up -d
```

### Start Monitoring (standalone mode)

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

Use standalone monitoring mode when your services are running on the host machine instead of in Docker.

### Access UIs

- Prometheus targets: `http://localhost:9090/targets`
- Grafana: `http://localhost:3100`
  - Default login: `admin` / `admin`

### Verify Metrics Endpoints

- `http://localhost:3000/metrics` (API Gateway)
- `http://localhost:3001/metrics` (Auth)
- `http://localhost:3002/metrics` (Payment)
- `http://localhost:3003/metrics` (Notification)
- `http://localhost:5000/metrics` (Booking)
- `http://localhost:8080/actuator/prometheus` (Event)
- `http://localhost:8081/actuator/prometheus` (Budget)

### Validate Prometheus

In Prometheus, run quick checks:

- `up`
- `rate(http_requests_total[5m])`
- `histogram_quantile(0.95, sum by (le, job) (rate(http_request_duration_seconds_bucket[5m])))`

### Validate Grafana Dashboard

Open `EventZen / EventZen Service Overview` and verify:

- service uptime (`up`)
- request throughput by service
- p95 latency by service
- 5xx error rate by service

Note: services use different HTTP metric names by runtime.

- Node.js: `http_requests_total`, `http_request_duration_seconds_*`
- Spring Boot: `http_server_requests_seconds_*`
- ASP.NET Core: `http_requests_received_total`, `http_request_duration_seconds_*`

The starter dashboard already combines these metric families so all 7 backend services appear.
