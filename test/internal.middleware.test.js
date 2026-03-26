const test = require("node:test");
const assert = require("node:assert/strict");

const { requireInternalService } = require("../src/middleware/internal.middleware");

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
  const req = {
    headers: {
      "x-internal-secret": "test-secret",
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

test("requireInternalService passes through with non-matching secret", () => {

  const req = {
    headers: {
      "x-internal-secret": "wrong-secret",
    },
  };
  const res = createMockResponse();

  let nextCalled = false;
  requireInternalService(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body, null);
});
