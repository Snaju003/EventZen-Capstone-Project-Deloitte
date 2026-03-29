const { randomBytes } = require("crypto");

const ACCESS_TOKEN_COOKIE_NAME = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || "csrfToken";

const DEFAULT_ACCESS_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_REFRESH_COOKIE_MAX_AGE_MS = 60 * 60 * 1000;
const DEFAULT_CSRF_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function toBoolean(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function normalizeSameSite(value) {
  const normalized = (value || "lax").toString().trim().toLowerCase();

  if (normalized === "strict") return "strict";
  if (normalized === "none") return "none";
  return "lax";
}

function resolveSecureCookies() {
  const explicit = toBoolean(process.env.AUTH_COOKIE_SECURE);
  if (explicit !== null) return explicit;
  return process.env.NODE_ENV === "production";
}

function resolveSameSite() {
  const sameSite = normalizeSameSite(process.env.AUTH_COOKIE_SAME_SITE);
  const secure = resolveSecureCookies();

  if (sameSite === "none" && !secure) {
    return "lax";
  }

  return sameSite;
}

function parseMaxAge(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getCookieBaseOptions() {
  const options = {
    httpOnly: true,
    secure: resolveSecureCookies(),
    sameSite: resolveSameSite(),
    path: "/",
  };

  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
  if (cookieDomain && cookieDomain.trim()) {
    options.domain = cookieDomain.trim();
  }

  return options;
}

function getAccessCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: parseMaxAge(
      process.env.ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
      DEFAULT_ACCESS_COOKIE_MAX_AGE_MS,
    ),
  };
}

function getRefreshCookieOptions() {
  return {
    ...getCookieBaseOptions(),
    maxAge: parseMaxAge(
      process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
      DEFAULT_REFRESH_COOKIE_MAX_AGE_MS,
    ),
  };
}

function getClearCookieOptions() {
  return getCookieBaseOptions();
}

function getCsrfCookieOptions() {
  const baseOptions = getCookieBaseOptions();

  return {
    ...baseOptions,
    httpOnly: false,
    maxAge: parseMaxAge(
      process.env.CSRF_COOKIE_MAX_AGE_MS,
      DEFAULT_CSRF_COOKIE_MAX_AGE_MS,
    ),
  };
}

function parseCookieHeader(cookieHeader) {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, chunk) => {
      const separatorIndex = chunk.indexOf("=");
      if (separatorIndex < 0) {
        return accumulator;
      }

      const key = chunk.slice(0, separatorIndex).trim();
      const value = chunk.slice(separatorIndex + 1).trim();

      if (!key) {
        return accumulator;
      }

      try {
        accumulator[key] = decodeURIComponent(value);
      } catch {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});
}

function getAccessTokenFromRequest(req) {
  return parseCookieHeader(req?.headers?.cookie)[ACCESS_TOKEN_COOKIE_NAME] || null;
}

function getRefreshTokenFromRequest(req) {
  return parseCookieHeader(req?.headers?.cookie)[REFRESH_TOKEN_COOKIE_NAME] || null;
}

function getCsrfTokenFromRequest(req) {
  return parseCookieHeader(req?.headers?.cookie)[CSRF_COOKIE_NAME] || null;
}

function generateCsrfToken() {
  return randomBytes(32).toString("hex");
}

function setCsrfCookie(res, csrfToken) {
  if (!csrfToken) return null;

  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
  return csrfToken;
}

function rotateCsrfCookie(res) {
  return setCsrfCookie(res, generateCsrfToken());
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  if (accessToken) {
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, getAccessCookieOptions());
  }

  if (refreshToken) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
  }
}

function clearAuthCookies(res) {
  const clearOptions = getClearCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, clearOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearOptions);
  res.clearCookie(CSRF_COOKIE_NAME, {
    ...clearOptions,
    httpOnly: false,
  });
}

module.exports = {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  parseCookieHeader,
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  getCsrfTokenFromRequest,
  setAuthCookies,
  setCsrfCookie,
  rotateCsrfCookie,
  clearAuthCookies,
};
