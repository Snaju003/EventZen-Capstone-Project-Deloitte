import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";

export function AdminRoute({ children }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <RouteLoadingFallback message="Loading admin access..." />;
  }

  const isAdmin = user?.role?.toLowerCase() === "admin";

  if (!isAdmin) {
    return <Navigate to="/events" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export function RoleRoute({ children, allowedRoles = [] }) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <RouteLoadingFallback message="Checking role permissions..." />;
  }

  const role = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((item) => item.toLowerCase());

  if (!normalizedAllowedRoles.includes(role)) {
    return <Navigate to="/events" state={{ from: location.pathname }} replace />;
  }

  return children;
}
