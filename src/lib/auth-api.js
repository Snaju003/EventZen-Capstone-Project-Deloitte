import axios from "axios";
import { attachCsrfHeader } from "@/lib/csrf";

export const BACKEND_BASE_URL =
  import.meta.env.BACKEND_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:3000";

export const AUTH_API_BASE = `${BACKEND_BASE_URL.replace(/\/$/, "")}/api/auth`;

export const authApi = axios.create({
  baseURL: AUTH_API_BASE,
  withCredentials: true,
});

authApi.interceptors.request.use((config) => attachCsrfHeader(config));

export async function ensureCsrfToken(config) {
  const response = await authApi.get("/csrf-token", config);
  return extractPayload(response)?.csrfToken || response?.data?.csrfToken || null;
}

export async function requestVendorRole(config) {
  const response = await authApi.post("/vendor-role/request", {}, config);
  return extractPayload(response);
}

export async function getPendingVendorRoleRequests(config) {
  const response = await authApi.get("/vendor-role/requests", config);
  const payload = extractPayload(response);
  return Array.isArray(payload?.requests) ? payload.requests : [];
}

export async function approveVendorRoleRequest(userId, config) {
  const response = await authApi.patch(`/vendor-role/requests/${userId}/approve`, {}, config);
  return extractPayload(response);
}

export async function getUsersByIds(userIds, config) {
  const response = await authApi.post(
    "/users/bulk",
    { userIds: Array.isArray(userIds) ? userIds : [] },
    config,
  );
  const payload = extractPayload(response);
  return Array.isArray(payload?.users) ? payload.users : [];
}

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
  const payload = error?.response?.data;
  const message =
    payload?.message ||
    payload?.error ||
    payload?.data?.message ||
    payload?.data?.error ||
    error?.message;

  return message || fallbackMessage || "Something went wrong. Please try again.";
}
