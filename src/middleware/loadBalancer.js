/**
 * Round-robin load balancer with basic health checks.
 *
 * Distributes requests across multiple upstream targets in a rotating fashion.
 * If a target fails health checks it is temporarily removed from the pool
 * and retried after a configurable cooldown period.
 */

const http = require("http");
const https = require("https");

const DEFAULT_HEALTH_CHECK_INTERVAL_MS = 30_000;
const DEFAULT_UNHEALTHY_COOLDOWN_MS = 15_000;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;

class RoundRobinBalancer {
  /**
   * @param {string[]} targets     — Array of upstream base URLs
   * @param {object}   [options]
   * @param {number}   [options.healthCheckIntervalMs]  — ms between health probes
   * @param {number}   [options.unhealthyCooldownMs]    — ms before retrying an unhealthy target
   * @param {string}   [options.healthPath]             — GET path used for health probes (default: "/")
   */
  constructor(targets, options = {}) {
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new Error("RoundRobinBalancer requires at least one target URL.");
    }

    this._targets = targets.map((url) => ({
      url: url.replace(/\/+$/, ""),
      healthy: true,
      lastFailedAt: 0,
    }));

    this._index = 0;
    this._healthPath = options.healthPath || "/";
    this._healthCheckIntervalMs =
      options.healthCheckIntervalMs ?? DEFAULT_HEALTH_CHECK_INTERVAL_MS;
    this._unhealthyCooldownMs =
      options.unhealthyCooldownMs ?? DEFAULT_UNHEALTHY_COOLDOWN_MS;

    // Only start health-check loop if there are multiple targets
    if (this._targets.length > 1 && this._healthCheckIntervalMs > 0) {
      this._timer = setInterval(
        () => this._runHealthChecks(),
        this._healthCheckIntervalMs,
      );
      this._timer.unref();
    }
  }

  /** Returns the number of healthy targets currently in the pool. */
  get healthyCount() {
    return this._targets.filter((t) => this._isAvailable(t)).length;
  }

  /** Returns the total number of targets. */
  get totalCount() {
    return this._targets.length;
  }

  /**
   * Pick the next available target URL using round-robin.
   * Falls back to the first target if all are marked unhealthy.
   */
  next() {
    const total = this._targets.length;

    // Single-target fast path
    if (total === 1) {
      return this._targets[0].url;
    }

    // Try each target once, starting from current index
    for (let i = 0; i < total; i++) {
      const candidateIndex = (this._index + i) % total;
      const candidate = this._targets[candidateIndex];

      if (this._isAvailable(candidate)) {
        this._index = (candidateIndex + 1) % total;
        return candidate.url;
      }
    }

    // All are unhealthy — fall through to first target and advance
    this._index = 1 % total;
    return this._targets[0].url;
  }

  /**
   * Mark a target as temporarily unhealthy (e.g. after a proxy error).
   * @param {string} targetUrl — the base URL that failed
   */
  markUnhealthy(targetUrl) {
    const normalized = targetUrl.replace(/\/+$/, "");
    const entry = this._targets.find((t) => t.url === normalized);
    if (entry) {
      entry.healthy = false;
      entry.lastFailedAt = Date.now();
    }
  }

  /** Stop background health-check timer (for clean shutdown / tests). */
  destroy() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  // ── internal helpers ──────────────────────────────────────────

  _isAvailable(entry) {
    if (entry.healthy) return true;

    // Allow re-attempt after cooldown
    return Date.now() - entry.lastFailedAt >= this._unhealthyCooldownMs;
  }

  async _runHealthChecks() {
    await Promise.allSettled(
      this._targets.map((entry) => this._checkOne(entry)),
    );
  }

  _checkOne(entry) {
    return new Promise((resolve) => {
      const url = `${entry.url}${this._healthPath}`;
      const client = url.startsWith("https") ? https : http;

      const req = client.get(url, { timeout: HEALTH_CHECK_TIMEOUT_MS }, (res) => {
        entry.healthy = res.statusCode >= 200 && res.statusCode < 500;
        if (entry.healthy) {
          entry.lastFailedAt = 0;
        }
        res.resume();
        resolve();
      });

      req.on("error", () => {
        entry.healthy = false;
        entry.lastFailedAt = Date.now();
        resolve();
      });

      req.on("timeout", () => {
        entry.healthy = false;
        entry.lastFailedAt = Date.now();
        req.destroy();
        resolve();
      });
    });
  }
}

module.exports = { RoundRobinBalancer };
