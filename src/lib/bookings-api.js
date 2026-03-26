import { apiClient } from "@/lib/api-client";

export async function getMyBookings() {
  const response = await apiClient.get("/bookings/me");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createBooking(payload) {
  const response = await apiClient.post("/bookings", payload);
  return response?.data || null;
}

export async function cancelMyBooking(bookingId) {
  const response = await apiClient.delete(`/bookings/${bookingId}`);
  return response?.data || {};
}

export async function getEventBookingCount(eventId) {
  const response = await apiClient.get(`/bookings/event/${eventId}/count`);
  return response?.data || {};
}

export async function getEventBookingCounts(eventIds = []) {
  const normalizedEventIds = Array.isArray(eventIds)
    ? eventIds.filter((eventId) => typeof eventId === "string" && eventId.trim())
    : [];

  if (!normalizedEventIds.length) {
    return {};
  }

  const response = await apiClient.get("/bookings/events/counts", {
    params: {
      eventIds: normalizedEventIds.join(","),
    },
  });

  return response?.data?.counts || {};
}

export async function getEventAttendees(eventId) {
  const response = await apiClient.get(`/bookings/event/${eventId}`);
  return Array.isArray(response?.data) ? response.data : [];
}

export async function adminCancelBooking(bookingId) {
  const response = await apiClient.delete(`/bookings/${bookingId}/admin`);
  return response?.data || {};
}
