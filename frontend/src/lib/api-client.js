import axios from "axios";
import { BACKEND_BASE_URL } from "@/lib/auth-api";
import { attachCsrfHeader } from "@/lib/csrf";

export const API_BASE_URL = `${BACKEND_BASE_URL.replace(/\/$/, "")}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => attachCsrfHeader(config));
