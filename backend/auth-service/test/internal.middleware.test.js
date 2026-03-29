const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

const { requireInternalService } = require("../src/middleware/internal.middleware");

function buildSignature({ secret, timestamp, method, path, service }) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${method}.${path}.${service}`)
    .digest("hex");
}

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
}

test("requireInternalService passes through with matching secret", () => {
  process.env.INTERNAL_SERVICE_SECRET = "test-secret";
  process.env.INTERNAL_SIGNATURE_TTL_MS = "60000";

  const timestamp = Date.now().toString();
  const serviceName = "booking-service";
  const method = "POST";
  const path = "/internal/users/bulk";

  const req = {
    method,
    originalUrl: path,
    headers: {
      "x-internal-secret": "test-secret",
      "x-internal-timestamp": timestamp,
      "x-internal-service": serviceName,
      "x-internal-signature": buildSignature({
        secret: "test-secret",
        timestamp,
        method,
        path,
        service: serviceName,
      }),
    },
  };
  const res = createMockResponse();

  let nextCalled = false;
  requireInternalService(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("requireInternalService blocks request with non-matching secret", () => {
  process.env.INTERNAL_SERVICE_SECRET = "test-secret";
  process.env.INTERNAL_SIGNATURE_TTL_MS = "60000";

  const timestamp = Date.now().toString();
  const serviceName = "booking-service";
  const method = "POST";
  const path = "/internal/users/bulk";

  const req = {
    method,
    originalUrl: path,
    headers: {
      "x-internal-secret": "wrong-secret",
      "x-internal-timestamp": timestamp,
      "x-internal-service": serviceName,
      "x-internal-signature": buildSignature({
        secret: "wrong-secret",
        timestamp,
        method,
        path,
        service: serviceName,
      }),
    },
  };
  const res = createMockResponse();

  let nextCalled = false;
  requireInternalService(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid internal service secret" });
});
