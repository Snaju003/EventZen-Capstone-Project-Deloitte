import axios from "axios";

const backendUrl =
  import.meta.env.BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export const AUTH_API_BASE = `${backendUrl.replace(/\/$/, "")}/api/auth`;

export const authApi = axios.create({
  baseURL: AUTH_API_BASE,
  withCredentials: true,
});

export function extractPayload(response) {
  return response?.data?.data ?? response?.data ?? {};
}

export function getMessage(response) {
  const payload = extractPayload(response);

  return (
    payload?.message ||
    response?.data?.message ||
    "Something went wrong. Please try again."
  );
}

export function extractTokens(payload) {
  return {
    accessToken:
      payload?.accessToken ||
      payload?.token ||
      payload?.tokens?.accessToken ||
      null,
    refreshToken:
      payload?.refreshToken ||
      payload?.tokens?.refreshToken ||
      null,
  };
}

export function extractUser(payload) {
  return payload?.user || payload?.me || payload?.profile || null;
}

export function getApiErrorMessage(error, fallbackMessage) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  return message || fallbackMessage || "Something went wrong. Please try again.";
}
