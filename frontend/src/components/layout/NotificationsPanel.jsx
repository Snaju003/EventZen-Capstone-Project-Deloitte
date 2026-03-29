import { useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bell,
  BellOff,
  Calendar,
  CheckCheck,
  ChevronRight,
  CircleCheck,
  CircleX,
  CreditCard,
  ScanLine,
  Ticket,
  UserCheck,
  ArrowRight,
} from "lucide-react";

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

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ──────────────────── icon + color config per notification type ──────────────── */
const TYPE_CONFIG = {
  "booking.confirmed": { icon: Ticket, bg: "bg-cyan-500/20", text: "text-cyan-400", ring: "ring-cyan-400/30" },
  "booking.cancelled": { icon: CircleX, bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400/30" },
  "booking.admin-cancelled": { icon: CircleX, bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400/30" },
  "booking.checked-in": { icon: ScanLine, bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400/30" },
  "event.published": { icon: Calendar, bg: "bg-violet-500/20", text: "text-violet-400", ring: "ring-violet-400/30" },
  "event.cancelled": { icon: CircleX, bg: "bg-amber-500/20", text: "text-amber-400", ring: "ring-amber-400/30" },
  "event.vendor-assigned": { icon: UserCheck, bg: "bg-indigo-500/20", text: "text-indigo-400", ring: "ring-indigo-400/30" },
  "event.vendor-confirmed": { icon: CheckCheck, bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400/30" },
  "event.vendor-declined": { icon: CircleX, bg: "bg-amber-500/20", text: "text-amber-400", ring: "ring-amber-400/30" },
  "payment.success": { icon: CreditCard, bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400/30" },
  "payment.failed": { icon: CreditCard, bg: "bg-rose-500/20", text: "text-rose-400", ring: "ring-rose-400/30" },
  "user.vendor-request": { icon: UserCheck, bg: "bg-indigo-500/20", text: "text-indigo-400", ring: "ring-indigo-400/30" },
  "user.vendor-approved": { icon: CircleCheck, bg: "bg-emerald-500/20", text: "text-emerald-400", ring: "ring-emerald-400/30" },
};

const DEFAULT_CONFIG = { icon: Bell, bg: "bg-slate-500/20", text: "text-slate-300", ring: "ring-slate-400/30" };

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || DEFAULT_CONFIG;
}

/* ──────────────────── notification item ──────────────────────────────────────── */
function NotificationItem({ notification, onClickItem, index }) {
  const config = getTypeConfig(notification.type);
  const Icon = config.icon;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
      onClick={() => onClickItem(notification)}
      className={`group relative mb-1 w-full rounded-xl px-3 py-3 text-left transition-all duration-200 ${
        notification.isRead
          ? "hover:bg-white/[0.06]"
          : "bg-gradient-to-r from-cyan-500/[0.08] to-transparent hover:from-cyan-500/[0.14]"
      }`}
    >
      {/* Unread indicator dot */}
      {!notification.isRead ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
        />
      ) : null}

      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg} ring-1 ${config.ring} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className={`h-4 w-4 ${config.text}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-[13px] font-semibold leading-tight ${notification.isRead ? "text-slate-200" : "text-white"}`}>
              {notification.title}
            </p>
            <span className="mt-0.5 shrink-0 text-[10px] font-medium text-slate-400/80">
              {getRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${notification.isRead ? "text-slate-400" : "text-slate-300/90"}`}>
            {notification.message}
          </p>
        </div>

        {/* Hover chevron */}
        <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-slate-500 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-slate-300 group-hover:opacity-100" />
      </div>
    </motion.button>
  );
}

/* ──────────────────── empty state ──────────────────────────────────────────── */
function EmptyNotifications() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 ring-1 ring-white/10"
      >
        <BellOff className="h-7 w-7 text-slate-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-sm font-semibold text-slate-200"
      >
        All caught up!
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-1 text-xs text-slate-400"
      >
        You have no notifications right now.
      </motion.p>
    </div>
  );
}

/* ──────────────────── bell button (exported for Navbar) ──────────────────── */
export function NotificationBellButton({ unreadCount, isOpen, onToggle }) {
  return (
    <button
      type="button"
      aria-label="Notifications"
      onClick={onToggle}
      className={`relative rounded-full p-2 transition-all duration-200 ${
        isOpen
          ? "bg-slate-800 text-white shadow-inner ring-1 ring-white/15"
          : "border border-white/25 bg-slate-900/45 text-slate-100 shadow-sm backdrop-blur hover:bg-slate-900/60"
      }`}
    >
      <Bell className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "scale-90" : ""}`} />

      {/* Animated badge */}
      <AnimatePresence>
        {unreadCount > 0 ? (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(244,63,94,0.45)]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

/* ──────────────────── main panel dropdown ──────────────────────────────────── */
export function NotificationsPanel({
  isOpen,
  notifications,
  unreadCount,
  onClose,
  onClickItem,
  onMarkAllRead,
}) {
  const panelRef = useRef(null);

  // Close on outside click
  const handleClickOutside = useCallback(
    (event) => {
      if (!isOpen) return;
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Don't close if clicking the bell button (it has its own toggle)
        if (event.target.closest("[aria-label='Notifications']")) return;
        onClose();
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-12 z-50 w-[24rem] overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950/[0.92] shadow-[0_32px_100px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/20">
                <Bell className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Notifications</p>
                <p className="text-[11px] text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            {unreadCount > 0 ? (
              <motion.button
                type="button"
                onClick={onMarkAllRead}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 ring-1 ring-white/[0.06] transition hover:bg-white/[0.1] hover:text-cyan-200"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </motion.button>
            ) : null}
          </div>

          {/* Scrollable list */}
          <div className="max-h-[26rem] overflow-y-auto overscroll-contain p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClickItem={onClickItem}
                  index={index}
                />
              ))
            )}
          </div>

          {/* Footer — view all link */}
          {notifications.length > 0 ? (
            <div className="border-t border-white/[0.06] px-4 py-2.5">
              <Link
                to="/notifications"
                onClick={onClose}
                className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[12px] font-semibold text-slate-300 ring-1 ring-white/[0.06] transition-all hover:bg-white/[0.08] hover:text-white"
              >
                View all notifications
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
