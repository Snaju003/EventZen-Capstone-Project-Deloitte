import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  Calendar,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  CreditCard,
  Eye,
  Filter,
  Inbox,
  ScanLine,
  Ticket,
  UserCheck,
} from "lucide-react";

import { SkeletonCardGrid } from "@/components/ui/SkeletonCard";
import { useNotifications } from "@/hooks/useNotifications";
import { staggerContainer, cardEnter } from "@/lib/animations";
import { useNotificationsPage } from "@/pages/notifications/hooks/useNotificationsPage";

/* ──────────── notification type config ──────────── */
const TYPE_CONFIG = {
  "booking.confirmed": { icon: Ticket, bg: "bg-cyan-100", text: "text-cyan-600", label: "Booking" },
  "booking.cancelled": { icon: CircleX, bg: "bg-rose-100", text: "text-rose-600", label: "Cancellation" },
  "booking.admin-cancelled": { icon: CircleX, bg: "bg-rose-100", text: "text-rose-600", label: "Cancellation" },
  "booking.checked-in": { icon: ScanLine, bg: "bg-emerald-100", text: "text-emerald-600", label: "Check-in" },
  "event.published": { icon: Calendar, bg: "bg-violet-100", text: "text-violet-600", label: "New Event" },
  "event.cancelled": { icon: CircleX, bg: "bg-amber-100", text: "text-amber-600", label: "Event Cancelled" },
  "event.vendor-assigned": { icon: UserCheck, bg: "bg-indigo-100", text: "text-indigo-600", label: "Assignment" },
  "event.vendor-confirmed": { icon: CheckCheck, bg: "bg-emerald-100", text: "text-emerald-600", label: "Confirmed" },
  "event.vendor-declined": { icon: CircleX, bg: "bg-amber-100", text: "text-amber-600", label: "Declined" },
  "payment.success": { icon: CreditCard, bg: "bg-emerald-100", text: "text-emerald-600", label: "Payment" },
  "payment.failed": { icon: CreditCard, bg: "bg-rose-100", text: "text-rose-600", label: "Payment" },
  "user.vendor-request": { icon: UserCheck, bg: "bg-indigo-100", text: "text-indigo-600", label: "Vendor Request" },
  "user.vendor-approved": { icon: CircleCheck, bg: "bg-emerald-100", text: "text-emerald-600", label: "Approved" },
};

const DEFAULT_CONFIG = { icon: Bell, bg: "bg-slate-100", text: "text-slate-500", label: "Update" };

function getConfig(type) {
  return TYPE_CONFIG[type] || DEFAULT_CONFIG;
}

function getRelativeTime(value) {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getFullDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ──────────── filter tabs ──────────── */
const FILTER_TABS = [
  { key: "all", label: "All", icon: Inbox },
  { key: "unread", label: "Unread", icon: Bell },
  { key: "read", label: "Read", icon: Eye },
];

/* ──────────── notification card ──────────── */
function NotificationCard({ notification, onClickItem, onMarkAsRead, index }) {
  const config = getConfig(notification.type);
  const Icon = config.icon;

  return (
    <motion.div
      variants={cardEnter}
      custom={index}
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        notification.isRead
          ? "border-slate-200/80"
          : "border-l-4 border-cyan-400 border-t-slate-200/80 border-r-slate-200/80 border-b-slate-200/80"
      }`}
    >
      {/* Subtle unread glow */}
      {!notification.isRead ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-50/60 via-transparent to-transparent" />
      ) : null}

      <button
        type="button"
        onClick={() => onClickItem(notification)}
        className="relative flex w-full items-start gap-4 px-5 py-4 text-left"
      >
        {/* Icon */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.bg} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className={`h-5 w-5 ${config.text}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${notification.isRead ? "text-slate-600" : "text-slate-900"}`}>
                  {notification.title}
                </h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
              </div>
              <p className={`mt-1 text-sm leading-relaxed ${notification.isRead ? "text-slate-400" : "text-slate-600"}`}>
                {notification.message}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-[11px] font-medium text-slate-400" title={getFullDateTime(notification.createdAt)}>
                {getRelativeTime(notification.createdAt)}
              </span>
              {!notification.isRead ? (
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
              ) : null}
            </div>
          </div>
        </div>
      </button>

      {/* Mark as read button — only for unread */}
      {!notification.isRead ? (
        <div className="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="flex items-center gap-1 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur transition hover:bg-slate-900"
          >
            <CheckCheck className="h-3 w-3" />
            Mark read
          </button>
        </div>
      ) : null}
    </motion.div>
  );
}

/* ──────────── empty state ──────────── */
function EmptyState({ filter }) {
  const messages = {
    all: { title: "No notifications yet", desc: "When something happens, you'll see it here." },
    unread: { title: "All caught up!", desc: "You have no unread notifications." },
    read: { title: "No read notifications", desc: "Notifications you've read will appear here." },
  };

  const msg = messages[filter] || messages.all;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-16"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
        <BellOff className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-700">{msg.title}</p>
      <p className="mt-1 text-sm text-slate-400">{msg.desc}</p>
    </motion.div>
  );
}

/* ──────────── pagination ──────────── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  startPage = Math.max(1, endPage - maxPagesToShow + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {startPage > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            1
          </button>
          {startPage > 2 ? (
            <span className="px-1 text-sm text-slate-400">…</span>
          ) : null}
        </>
      ) : null}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
            p === page
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}

      {endPage < totalPages ? (
        <>
          {endPage < totalPages - 1 ? (
            <span className="px-1 text-sm text-slate-400">…</span>
          ) : null}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {totalPages}
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/* ──────────── page component ──────────── */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { navigationTargetFor } = useNotifications();

  const {
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
  } = useNotificationsPage();

  const handleClickItem = useCallback(
    async (notification) => {
      if (!notification?.isRead) {
        await markOneAsRead(notification.id);
      }
      const target = navigationTargetFor(notification);
      navigate(target);
    },
    [markOneAsRead, navigate, navigationTargetFor],
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-28 h-48 w-48 bg-violet-300/20" />
      <div className="soft-orb right-[-3rem] top-40 h-40 w-40 bg-cyan-200/25" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex-1">
        {/* ── Hero header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-violet-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Stay Updated</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
                Notifications
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                All your event updates, booking confirmations, and important alerts in one place.
              </p>
            </div>

            {/* Unread count badge */}
            {unreadCount > 0 ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/25 text-sm font-bold text-cyan-300">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
                <span className="text-sm font-medium text-slate-300">
                  unread
                </span>
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* ── Toolbar: filters + mark all read ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
            <div className="mr-1.5 flex items-center gap-1 pl-2 text-slate-400">
              <Filter className="h-3.5 w-3.5" />
            </div>
            {FILTER_TABS.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`relative z-10 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    filter === tab.key
                      ? "font-bold text-slate-800"
                      : "font-medium text-slate-500 hover:text-slate-700"
                  }`}
                  onClick={() => setFilter(tab.key)}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 ? (
                    <span className="ml-0.5 rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-600">
                      {unreadCount}
                    </span>
                  ) : null}
                  {filter === tab.key ? (
                    <motion.div
                      layoutId="notification-filter-indicator"
                      className="absolute inset-0 rounded-lg bg-slate-100"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <CheckCheck className="h-4 w-4 text-cyan-600" />
              Mark all as read
            </motion.button>
          ) : null}
        </motion.div>

        {/* ── Error state ── */}
        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button type="button" onClick={() => loadNotifications(1)} className="mt-2 text-sm font-semibold underline">
              Try again
            </button>
          </div>
        ) : null}

        {/* ── Loading ── */}
        {isLoading ? (
          <SkeletonCardGrid count={4} columns="grid-cols-1" />
        ) : items.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filter}-${page}`}
                className="grid gap-3"
                variants={staggerContainer(0.04, 0)}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
              >
                {items.map((notification, index) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClickItem={handleClickItem}
                    onMarkAsRead={markOneAsRead}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </>
        ) : (
          <EmptyState filter={filter} />
        )}
      </main>
    </div>
  );
}
