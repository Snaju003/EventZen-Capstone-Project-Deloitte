import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-api";

const NotificationsContext = createContext(null);
const DEFAULT_NOTIFICATIONS_POLL_MS = 5000;

function resolvePollIntervalMs() {
  const configured = Number(import.meta.env.VITE_NOTIFICATIONS_POLL_MS);

  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_NOTIFICATIONS_POLL_MS;
  }

  return Math.max(configured, 2000);
}

function getNavigationTarget(notification) {
  const type = String(notification?.type || "");

  if (type.startsWith("booking.")) {
    return "/my-bookings";
  }

  if (type.startsWith("payment.")) {
    return "/my-bookings";
  }

  if (type.startsWith("event.vendor-")) {
    return "/vendor/requests";
  }

  if (type === "user.vendor-request") {
    return "/admin/vendors";
  }

  if (type === "user.vendor-approved") {
    return "/admin/dashboard";
  }

  const eventId = notification?.metadata?.eventId;
  if (eventId) {
    return `/events/${eventId}`;
  }

  return "/events";
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const pollIntervalMs = resolvePollIntervalMs();

  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const lastUnreadCountRef = useRef(0);

  const refreshNotifications = useCallback(async () => {
    if (isInitializing) {
      return;
    }

    if (!isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      lastUnreadCountRef.current = 0;
      return;
    }

    setIsLoading(true);

    try {
      const [notificationsResult, unread] = await Promise.all([
        getNotifications({ page: 1, limit: 12 }),
        getUnreadCount(),
      ]);

      const nextItems = Array.isArray(notificationsResult?.items)
        ? notificationsResult.items
        : [];

      setItems(nextItems);
      setUnreadCount(unread);

      if (unread > lastUnreadCountRef.current) {
        const firstItem = nextItems[0];
        if (firstItem?.message) {
          toast.success(firstItem.message, { id: "new-notification" });
        }
      }

      lastUnreadCountRef.current = unread;
    } catch {
      // Keep UI stable on intermittent failures.
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isInitializing]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (isInitializing || !isAuthenticated) {
      return undefined;
    }

    const interval = setInterval(() => {
      refreshNotifications();
    }, pollIntervalMs);

    return () => clearInterval(interval);
  }, [isAuthenticated, isInitializing, pollIntervalMs, refreshNotifications]);

  useEffect(() => {
    if (isInitializing || !isAuthenticated) {
      return undefined;
    }

    const onFocus = () => {
      refreshNotifications();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshNotifications();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated, isInitializing, refreshNotifications]);

  const markOneAsRead = useCallback(async (id) => {
    if (!id) {
      return null;
    }

    const wasUnread = items.some((item) => item.id === id && !item.isRead);

    const updated = await markNotificationRead(id).catch(() => null);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            isRead: true,
          }
          : item,
      ),
    );
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      lastUnreadCountRef.current = Math.max(lastUnreadCountRef.current - 1, 0);
    }

    return updated;
  }, [items]);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsRead().catch(() => 0);

    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    lastUnreadCountRef.current = 0;
  }, []);

  const value = useMemo(() => ({
    isLoading,
    items,
    markAllAsRead,
    markOneAsRead,
    navigationTargetFor: getNavigationTarget,
    refreshNotifications,
    unreadCount,
  }), [isLoading, items, markAllAsRead, markOneAsRead, refreshNotifications, unreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsContext };
