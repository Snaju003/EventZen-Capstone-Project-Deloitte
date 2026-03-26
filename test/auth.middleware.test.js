const test = require("node:test");
const assert = require("node:assert/strict");

const AuthMiddleware = require("../src/middleware/auth.middleware");

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

test("authenticateResetToken allows password reset token", () => {
  const middleware = new AuthMiddleware({
    tokenService: {
      verifyToken: () => ({ sub: "user-1", purpose: "password_reset" }),
    },
  });

  const req = {
    headers: {
      authorization: "Bearer reset-token",
    },
  };
  const res = createMockResponse();

  let nextCalled = false;
  middleware.authenticateResetToken(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.sub, "user-1");
  assert.equal(res.statusCode, 200);
});

test("authenticateResetToken rejects token without password_reset purpose", () => {
  const middleware = new AuthMiddleware({
    tokenService: {
      verifyToken: () => ({ sub: "user-1", purpose: "access" }),
    },
  });

  const req = {
    headers: {
      authorization: "Bearer access-token",
    },
  };
  const res = createMockResponse();

  middleware.authenticateResetToken(req, res, () => {
    throw new Error("next should not be called");
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden" });
});

test("authenticateResetToken rejects missing bearer token", () => {
  const middleware = new AuthMiddleware({
    tokenService: {
      verifyToken: () => ({ sub: "user-1", purpose: "password_reset" }),
    },
  });

  const req = { headers: {} };
  const res = createMockResponse();

  middleware.authenticateResetToken(req, res, () => {
    throw new Error("next should not be called");
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});
