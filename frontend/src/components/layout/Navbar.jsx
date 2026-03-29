import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, LayoutDashboard, MapPin, Menu, Ticket, UserCheck, X } from "lucide-react";
import { NotificationBellButton, NotificationsPanel } from "@/components/layout/NotificationsPanel";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const publicNavLinks = [
  { label: "Home", to: "/", type: "route" },
  { label: "Events", to: "/events", type: "route" },
  { label: "How it works", to: "/#how-it-works", type: "anchor" },
];


const userNavLinks = [
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/venues", label: "Venues", icon: MapPin },
  { to: "/my-bookings", label: "My Bookings", icon: Ticket },
];

const adminNavLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/venues", label: "Venues", icon: MapPin },
  { to: "/admin/vendors", label: "Vendor Requests", icon: UserCheck },
];

const vendorNavLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/requests", label: "My Requests", icon: Ticket },
];

function PublicNavItem({ item }) {
  if (item.type === "anchor") {
    return (
      <a href={item.to} className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-primary">
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.to} className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-primary">
      {item.label}
    </Link>
  );
}

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    items: notifications,
    unreadCount,
    markOneAsRead,
    markAllAsRead,
    navigationTargetFor,
    refreshNotifications,
  } = useNotifications();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";

  const appNavLinks = isAdmin ? adminNavLinks : isVendor ? vendorNavLinks : userNavLinks;
  const authReturnPath = location.state?.from || `${location.pathname}${location.search}${location.hash}`;
  const logoTarget = isAuthenticated ? (isAdmin || isVendor ? "/admin/dashboard" : "/") : "/";
  const isLandingRoute = location.pathname === "/";
  const useTransparentLandingNav = isLandingRoute && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isLinkActive = (to) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const mobilePublicLinks = useMemo(() => publicNavLinks, []);

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      await markOneAsRead(notification.id);
    }

    const target = navigationTargetFor(notification);
    navigate(target);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-all duration-300 sm:px-5 sm:py-3 ${useTransparentLandingNav ? "border-white/55 bg-white/55 shadow-[0_10px_30px_-24px_rgba(33,66,118,0.42)] backdrop-blur-sm" : "border-white/70 bg-white/85 shadow-[0_12px_36px_-26px_rgba(33,66,118,0.55)] backdrop-blur"}`}
      >
        <Link to={logoTarget} className="text-slate-700">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 320, damping: 22 }} className="flex items-center gap-3">
            <motion.div
              className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-blue-600 to-cyan-600 text-white shadow-md"
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Ticket className="h-4 w-4" />
            </motion.div>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight text-slate-900">EventZen</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Event Operations Suite</p>
            </div>
          </motion.div>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-6">
          {isAuthenticated ? (
            <nav className="hidden items-center gap-6 lg:flex">
              {appNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${isLinkActive(link.to) ? "bg-primary/12 text-primary" : "text-slate-600 hover:bg-white/70 hover:text-primary"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="hidden items-center gap-6 md:flex">
              {publicNavLinks.map((item) => (
                <PublicNavItem key={item.label} item={item} />
              ))}
            </nav>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 md:gap-4 md:pl-5">
              <div className="relative">
                <NotificationBellButton
                  unreadCount={unreadCount}
                  isOpen={notificationsOpen}
                  onToggle={() => {
                    const next = !notificationsOpen;
                    setNotificationsOpen(next);
                    if (next) refreshNotifications();
                  }}
                />

                <NotificationsPanel
                  isOpen={notificationsOpen}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onClose={() => setNotificationsOpen(false)}
                  onClickItem={(notification) => {
                    setNotificationsOpen(false);
                    handleNotificationClick(notification);
                  }}
                  onMarkAllRead={markAllAsRead}
                />
              </div>

              <Link to="/profile" aria-label="Go to profile" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <div
                  className="h-10 w-10 rounded-full border border-white bg-slate-200 bg-cover bg-center bg-no-repeat shadow-sm"
                  style={user?.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                  aria-label="User profile avatar"
                  role="img"
                />
              </Link>
              <motion.button
                type="button"
                onClick={() => setMobileOpen((previous) => !previous)}
                className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary lg:hidden"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.92 }}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="hidden border-white bg-white/85 md:inline-flex">
                <Link to="/auth" state={{ activeTab: "login", from: authReturnPath }}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm" className="hidden bg-primary md:inline-flex">
                <Link to="/auth" state={{ activeTab: "register", from: authReturnPath }}>
                  Get started
                </Link>
              </Button>
              <motion.button
                type="button"
                onClick={() => setMobileOpen((previous) => !previous)}
                className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary md:hidden"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.92 }}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto mt-2 flex w-full max-w-6xl flex-col gap-1 rounded-2xl border border-white/70 bg-white/90 px-3 pb-3 pt-2 shadow-[0_12px_36px_-26px_rgba(33,66,118,0.55)] backdrop-blur sm:px-4"
          >
            {isAuthenticated
              ? appNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isLinkActive(link.to) ? "bg-primary/12 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })
              : mobilePublicLinks.map((item) =>
                item.type === "anchor" ? (
                  <a
                    key={item.label}
                    href={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ),
              )}

            {!isAuthenticated ? (
              <div className="mt-2 flex items-center gap-2 px-1">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/auth" state={{ activeTab: "login", from: authReturnPath }} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to="/auth" state={{ activeTab: "register", from: authReturnPath }} onClick={() => setMobileOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            ) : null}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
