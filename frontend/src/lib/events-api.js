import { apiClient } from "@/lib/api-client";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeVenue(venue) {
  if (!venue || typeof venue !== "object") {
    return null;
  }

  const resolvedId = venue.id || venue._id || "";
  if (!resolvedId) {
    return null;
  }

  return {
    ...venue,
    id: String(resolvedId),
  };
}

function normalizeVenuesPayload(payload) {
  const rawVenues = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.content)
        ? payload.content
        : [];

  return rawVenues
    .map(normalizeVenue)
    .filter(Boolean);
}

function normalizePagedResponse(payload, fallbackPage = 1, fallbackSize = 12) {
  if (Array.isArray(payload)) {
    const items = asArray(payload);
    return {
      items,
      page: fallbackPage,
      size: fallbackSize,
      total: items.length,
      totalPages: items.length ? 1 : 0,
      hasNext: false,
    };
  }

  return {
    items: asArray(payload?.items),
    page: Number(payload?.page) || fallbackPage,
    size: Number(payload?.size) || fallbackSize,
    total: Number(payload?.total) || 0,
    totalPages: Number(payload?.totalPages) || 0,
    hasNext: Boolean(payload?.hasNext),
  };
}

export async function getEvents() {
  const response = await apiClient.get("/events");
  return asArray(response?.data);
}

export async function getFilteredEvents(filters = {}) {
  const response = await apiClient.get("/events", { params: filters });
  return asArray(response?.data);
}

export async function getEventsPage(params = {}) {
  const fallbackPage = Number(params?.page) || 1;
  const fallbackSize = Number(params?.size) || 12;
  const normalizedParams = {
    ...params,
    venueId: params?.venueId === "__all__" ? undefined : params?.venueId,
  };

  const response = await apiClient.get("/events/page", { params: normalizedParams });
  return normalizePagedResponse(response?.data, fallbackPage, fallbackSize);
}

export async function getEventById(eventId) {
  const response = await apiClient.get(`/events/${eventId}`);
  return response?.data || null;
}

export async function getVenues() {
  const response = await apiClient.get("/venues");
  return normalizeVenuesPayload(response?.data);
}

export async function getVendors() {
  const response = await apiClient.get("/vendors");
  return asArray(response?.data);
}

export async function createEvent(payload) {
  const response = await apiClient.post("/events", payload);
  return response?.data || null;
}

export async function generateEventDescription(title) {
  const response = await apiClient.post("/events/generate-description", { title });
  return response?.data?.description || "";
}

export async function updateEvent(eventId, payload) {
  const response = await apiClient.put(`/events/${eventId}`, payload);
  return response?.data || null;
}

export async function deleteEvent(eventId) {
  await apiClient.delete(`/events/${eventId}`);
}

export async function publishEvent(eventId) {
  const response = await apiClient.post(`/events/${eventId}/publish`);
  return response?.data || null;
}

export async function rejectEvent(eventId, reason) {
  const response = await apiClient.post(`/events/${eventId}/reject`, { reason });
  return response?.data || null;
}

export async function cancelEvent(eventId) {
  const response = await apiClient.post(`/events/${eventId}/cancel`);
  return response?.data || null;
}

export async function toggleEventRegistration(eventId) {
  const response = await apiClient.post(`/events/${eventId}/toggle-registration`);
  return response?.data || null;
}

export async function assignVendorToEvent(eventId, payload) {
  const response = await apiClient.post(`/events/${eventId}/vendors`, payload);
  return response?.data || null;
}

export async function approveEventVendor(eventId, vendorId) {
  const response = await apiClient.post(`/events/${eventId}/vendors/${vendorId}/approve`);
  return response?.data || null;
}

export async function removeVendorFromEvent(eventId, vendorId) {
  const response = await apiClient.delete(`/events/${eventId}/vendors/${vendorId}`);
  return response?.data || null;
}

export async function createVenue(payload) {
  const response = await apiClient.post("/venues", payload);
  return response?.data || null;
}

export async function generateVenueDescription(name) {
  const response = await apiClient.post("/venues/generate-description", { title: name });
  return response?.data?.description || "";
}

export async function updateVenue(venueId, payload) {
  const response = await apiClient.put(`/venues/${venueId}`, payload);
  return response?.data || null;
}

export async function deleteVenue(venueId) {
  await apiClient.delete(`/venues/${venueId}`);
}

export async function createVendor(payload) {
  const response = await apiClient.post("/vendors", payload);
  return response?.data || null;
}

export async function updateVendor(vendorId, payload) {
  const response = await apiClient.put(`/vendors/${vendorId}`, payload);
  return response?.data || null;
}

export async function deleteVendor(vendorId) {
  await apiClient.delete(`/vendors/${vendorId}`);
}
