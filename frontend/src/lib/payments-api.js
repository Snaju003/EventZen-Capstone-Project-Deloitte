import { apiClient } from "@/lib/api-client";

export async function createPaymentOrder(payload) {
  const seatCount = Number(payload?.seatCount);

  return {
    orderId: `bypass_order_${Date.now()}`,
    amount: 0,
    currency: "INR",
    seatCount: Number.isFinite(seatCount) && seatCount > 0 ? seatCount : 1,
    eventId: payload?.eventId || null,
    keyId: "bypass_key",
    bypassed: true,
  };
}

export async function verifyPayment(payload) {
  return {
    verified: true,
    bypassed: true,
    paymentId: payload?.razorpayPaymentId || `bypass_payment_${Date.now()}`,
  };
}

export async function getConvenienceFeeRevenueSummary() {
  const response = await apiClient.get("/payments/revenue/summary");
  return response?.data || null;
}
