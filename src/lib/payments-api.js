import { apiClient } from "@/lib/api-client";

export async function createPaymentOrder(payload) {
  const response = await apiClient.post("/payments/orders", payload);
  return response?.data || null;
}

export async function verifyPayment(payload) {
  const response = await apiClient.post("/payments/verify", payload);
  return response?.data || null;
}
