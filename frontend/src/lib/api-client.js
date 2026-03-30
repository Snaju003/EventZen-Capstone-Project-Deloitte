import axios from "axios";
import { authApi, BACKEND_BASE_URL } from "@/lib/auth-api";
import { attachCsrfHeader } from "@/lib/csrf";

export const API_BASE_URL = `${BACKEND_BASE_URL.replace(/\/$/, "")}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => attachCsrfHeader(config));

let refreshInFlight = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const statusCode = error?.response?.status;

    if (!originalRequest || statusCode !== 401 || originalRequest.__isRetryRequest) {
      return Promise.reject(error);
    }

    originalRequest.__isRetryRequest = true;

    try {
      if (!refreshInFlight) {
        refreshInFlight = authApi.post("/refresh-token", {}).finally(() => {
          refreshInFlight = null;
        });
      }

      await refreshInFlight;
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);
