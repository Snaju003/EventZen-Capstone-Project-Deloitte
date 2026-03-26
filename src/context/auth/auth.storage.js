export const PENDING_VERIFICATION_KEY = "auth.pendingVerification";
export const RESET_TOKEN_KEY = "auth.resetToken";
export const LEGACY_ACCESS_TOKEN_KEY = "auth.accessToken";
export const LEGACY_REFRESH_TOKEN_KEY = "auth.refreshToken";

export const defaultPendingVerification = {
  email: "",
  purpose: "register",
};

export function readStorage(key) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

export function writeStorage(key, value) {
  if (typeof window === "undefined") return;

  if (!value) {
    window.localStorage.removeItem(key);
    return;
  }

  window.localStorage.setItem(key, value);
}

export function readPendingVerification() {
  const rawValue = readStorage(PENDING_VERIFICATION_KEY);
  if (!rawValue) return defaultPendingVerification;

  try {
    return JSON.parse(rawValue);
  } catch {
    return defaultPendingVerification;
  }
}
