const { timingSafeEqual } = require("crypto");
const { parseCookieHeader } = require("../utils/cookieParser");

const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "csrfToken";
const CSRF_HEADER_NAME = (process.env.CSRF_HEADER_NAME || "x-csrf-token").toLowerCase();

function hasAuthCookies(cookies) {
  return Boolean(cookies[ACCESS_TOKEN_COOKIE_NAME] || cookies[REFRESH_TOKEN_COOKIE_NAME]);
}

function isSafeMethod(method) {
  return method === "GET" || method === "HEAD" || method === "OPTIONS";
}

function safeTokenMatch(a, b) {
  if (!a || !b) return false;

  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}

function verifyCsrfToken(req, res, next) {
  if (isSafeMethod(req.method)) {
    return next();
  }

  const cookies = parseCookieHeader(req.headers.cookie);
  if (!hasAuthCookies(cookies)) {
    return next();
  }

  const cookieToken = cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token is required",
    });
  }

  if (!safeTokenMatch(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      message: "CSRF token is invalid",
    });
  }

  return next();
}

module.exports = {
  verifyCsrfToken,
  parseCookieHeader,
  safeTokenMatch,
};
