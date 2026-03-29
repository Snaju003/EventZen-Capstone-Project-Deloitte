import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (isInitializing) {
    return <RouteLoadingFallback message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ activeTab: "login", from: returnTo }} replace />;
  }

  return children;
}
