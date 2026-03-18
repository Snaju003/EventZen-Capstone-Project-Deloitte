import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  LayoutDashboard,
  Menu,
  Ticket,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const userNavLinks = [
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/venues", label: "Venues", icon: Calendar },
  { to: "/my-bookings", label: "My Bookings", icon: Ticket },
];

const adminNavLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/venues", label: "Venues", icon: Calendar },
  { to: "/admin/vendors", label: "Vendor Requests", icon: Calendar },
];

const vendorNavLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vendor/requests", label: "My Requests", icon: Calendar },
];

export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) return null;

  const role = user?.role?.toLowerCase();
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const navLinks = isAdmin ? adminNavLinks : isVendor ? vendorNavLinks : userNavLinks;
  const defaultBackPath = isAdmin || isVendor ? "/admin/dashboard" : "/events";

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(defaultBackPath);
  };

  const isLinkActive = (link) => {
    if (link.matchPrefix) {
      return location.pathname.startsWith(link.to);
    }

    if ((isAdmin || isVendor) && link.to.startsWith("/admin")) {
      return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
    }

    return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
  };

  const getDesktopLinkClass = (link) => {
    return `text-sm font-medium transition-colors ${isLinkActive(link) ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-slate-600 hover:text-primary"}`;
  };

  const getMobileLinkClass = (link) => {
    return `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isLinkActive(link) ? "bg-primary/10 text-primary font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-primary"}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between whitespace-nowrap px-4 py-3 md:px-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <Link to={isAdmin || isVendor ? "/admin/dashboard" : "/profile"} className="flex items-center gap-4 text-primary">
            <div className="flex size-6 items-center justify-center rounded bg-primary text-white">
              <Ticket className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900">EventZen</h2>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-6">
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className={getDesktopLinkClass(link)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 md:gap-4 md:pl-6">
            <Link to="/profile" aria-label="Go to profile" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <div
                className="h-10 w-10 rounded-full border border-slate-200 bg-slate-200 bg-cover bg-center bg-no-repeat"
                style={user?.avatar ? { backgroundImage: `url("${user.avatar}")` } : {}}
                aria-label="User profile avatar"
                role="img"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 text-slate-700 transition-colors hover:text-primary lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={getMobileLinkClass(link)}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
