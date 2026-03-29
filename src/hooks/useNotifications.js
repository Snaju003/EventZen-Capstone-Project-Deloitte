import { useContext } from "react";

import { NotificationsContext } from "@/context/NotificationsContext";

const notificationsFallback = {
  isLoading: false,
  items: [],
  markAllAsRead: async () => {},
  markOneAsRead: async () => null,
  navigationTargetFor: () => "/events",
  refreshNotifications: async () => {},
  unreadCount: 0,
};

export function useNotifications() {
  const context = useContext(NotificationsContext);
  return context || notificationsFallback;
}
