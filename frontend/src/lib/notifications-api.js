import { apiClient } from "@/lib/api-client";

export async function getNotifications(params) {
  const response = await apiClient.get("/notifications", { params });
  return response?.data || { items: [], pagination: null };
}

export async function getUnreadCount() {
  const response = await apiClient.get("/notifications/unread-count");
  return Number(response?.data?.unreadCount || 0);
}

export async function markNotificationRead(notificationId) {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response?.data || null;
}

export async function markAllNotificationsRead() {
  const response = await apiClient.patch("/notifications/read-all");
  return Number(response?.data?.modifiedCount || 0);
}
