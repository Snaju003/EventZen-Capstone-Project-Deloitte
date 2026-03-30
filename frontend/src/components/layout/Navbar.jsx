import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Home, Info, LayoutDashboard, MapPin, Menu, Ticket, UserCheck, X } from "lucide-react";
import { NotificationBellButton, NotificationsPanel } from "@/components/layout/NotificationsPanel";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const publicNavLinks = [
  { label: "Home", to: "/", type: "route", icon: Home },
  { label: "Events", to: "/events", type: "route", icon: Calendar },
  { label: "How it works", to: "/#how-it-works", type: "anchor", icon: Info },
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

  const handleAnchorClick = (e, link) => {
    e.preventDefault();
    const hash = link.to.split("#")[1];
    if (location.pathname === "/") {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

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
        className={`mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-all duration-300 sm:px-5 sm:py-2.5 ${useTransparentLandingNav ? "border-white/55 bg-white/55 shadow-[0_10px_30px_-24px_rgba(33,66,118,0.42)] backdrop-blur-sm" : "border-white/70 bg-white/85 shadow-[0_12px_36px_-26px_rgba(33,66,118,0.55)] backdrop-blur"}`}
      >
        <Link to={logoTarget} className="text-slate-700">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 320, damping: 22 }} className="flex items-center gap-3">
            <motion.div
              className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-blue-600 to-cyan-600 text-white shadow-md"
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Ticket className="h-4.5 w-4.5" />
            </motion.div>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight text-slate-900">EventZen</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Event Operations Suite</p>
            </div>
          </motion.div>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-5">
          {isAuthenticated ? (
            <nav className="hidden items-center gap-1 lg:flex">
              {appNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isLinkActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                      active
                        ? "text-primary"
                        : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-800"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-slate-400"}`} />
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg bg-primary/8 ring-1 ring-primary/15"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <nav className="hidden items-center gap-1 md:flex">
              {publicNavLinks.map((link) => {
                const Icon = link.icon;
                const active = link.type === "anchor" ? false : isLinkActive(link.to);
                const className = `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  active ? "text-primary" : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-800"
                }`;
                const inner = (
                  <>
                    <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-slate-400"}`} />
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-lg bg-primary/8 ring-1 ring-primary/15"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                  </>
                );
                return link.type === "anchor" ? (
                  <button key={link.label} type="button" onClick={(e) => handleAnchorClick(e, link)} className={className}>{inner}</button>
                ) : (
                  <Link key={link.to} to={link.to} className={className}>{inner}</Link>
                );
              })}
            </nav>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 border-l border-slate-200/60 pl-3 md:gap-3 md:pl-4">
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
                <UserAvatar name={user?.name} avatar={user?.avatar} size="sm" className="border-2 border-white shadow-sm ring-1 ring-slate-100" />
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
              : mobilePublicLinks.map((link) => {
                const Icon = link.icon;
                const active = link.type === "anchor" ? false : isLinkActive(link.to);
                const cls = `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? "bg-primary/12 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`;
                return link.type === "anchor" ? (
                  <button key={link.label} type="button" onClick={(e) => { handleAnchorClick(e, link); setMobileOpen(false); }} className={cls}>
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className={cls}>
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}

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
