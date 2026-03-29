import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications-api";

export function useNotificationsPage() {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"

  const limit = 15;

  const loadNotifications = useCallback(
    async (targetPage = 1) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setLoadError("");

      try {
        const params = { page: targetPage, limit };
        if (filter === "unread") params.unread = true;
        if (filter === "read") params.read = true;

        const [result, unread] = await Promise.all([
          getNotifications(params),
          getUnreadCount(),
        ]);

        const nextItems = Array.isArray(result?.items) ? result.items : [];
        const pagination = result?.pagination;

        setItems(nextItems);
        setPage(pagination?.page || targetPage);
        setTotalPages(pagination?.pages || 1);
        setUnreadCount(unread);
      } catch (error) {
        setLoadError(getApiErrorMessage(error, "Could not load notifications."));
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, filter],
  );

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const goToPage = useCallback(
    (targetPage) => {
      if (targetPage < 1 || targetPage > totalPages) return;
      loadNotifications(targetPage);
    },
    [loadNotifications, totalPages],
  );

  const markOneAsRead = useCallback(
    async (id) => {
      if (!id) return;

      await markNotificationRead(id).catch(() => null);

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    },
    [],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not mark all as read.");
    }
  }, []);

  return {
    filter,
    goToPage,
    isLoading,
    items,
    loadError,
    loadNotifications,
    markAllAsRead,
    markOneAsRead,
    page,
    setFilter,
    totalPages,
    unreadCount,
  };
}
