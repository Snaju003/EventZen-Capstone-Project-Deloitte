const CSRF_COOKIE_NAME = import.meta.env.VITE_CSRF_COOKIE_NAME || "csrfToken";
const CSRF_HEADER_NAME = import.meta.env.VITE_CSRF_HEADER_NAME || "X-CSRF-Token";

function parseCookieString(cookieString) {
  if (!cookieString || typeof cookieString !== "string") return {};

  return cookieString
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, chunk) => {
      const separatorIndex = chunk.indexOf("=");
      if (separatorIndex < 0) return accumulator;

      const key = chunk.slice(0, separatorIndex).trim();
      const value = chunk.slice(separatorIndex + 1).trim();
      if (!key) return accumulator;

      try {
        accumulator[key] = decodeURIComponent(value);
      } catch {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
}

export function getCsrfTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const cookies = parseCookieString(document.cookie);
  return cookies[CSRF_COOKIE_NAME] || null;
}

export function isMutatingMethod(method) {
  const normalizedMethod = String(method || "get").toUpperCase();
  return ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod);
}

export function attachCsrfHeader(config) {
  if (!isMutatingMethod(config?.method)) {
    return config;
  }

  const csrfToken = getCsrfTokenFromCookie();
  if (!csrfToken) return config;

  config.headers = config.headers || {};
  if (!config.headers[CSRF_HEADER_NAME]) {
    config.headers[CSRF_HEADER_NAME] = csrfToken;
  }

  return config;
}

export const csrfConfig = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME,
};
