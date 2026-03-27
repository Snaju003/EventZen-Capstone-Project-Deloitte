const test = require("node:test");
const assert = require("node:assert/strict");

const { verifyCsrfToken } = require("../src/middleware/csrf.middleware");

function createReq({ method = "GET", cookie = "", headers = {} } = {}) {
  return {
    method,
    headers: {
      cookie,
      ...headers,
    },
  };
}

function createRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test("allows safe GET requests without CSRF token", () => {
  const req = createReq({ method: "GET" });
  const res = createRes();
  let nextCalled = false;

  verifyCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test("allows mutating request when auth cookies are absent", () => {
  const req = createReq({ method: "POST" });
  const res = createRes();
  let nextCalled = false;

  verifyCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test("blocks mutating request when auth cookie exists but CSRF header is missing", () => {
  const req = createReq({ method: "POST", cookie: "accessToken=abc123" });
  const res = createRes();
  let nextCalled = false;

  verifyCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.message, "CSRF token is required");
});

test("blocks mutating request when CSRF cookie/header mismatch", () => {
  const req = createReq({
    method: "PATCH",
    cookie: "accessToken=abc123; csrfToken=token-one",
    headers: { "x-csrf-token": "token-two" },
  });
  const res = createRes();
  let nextCalled = false;

  verifyCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.payload.message, "CSRF token is invalid");
});

test("allows mutating request when CSRF cookie/header match", () => {
  const req = createReq({
    method: "DELETE",
    cookie: "accessToken=abc123; csrfToken=token-ok",
    headers: { "x-csrf-token": "token-ok" },
  });
  const res = createRes();
  let nextCalled = false;

  verifyCsrfToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});
