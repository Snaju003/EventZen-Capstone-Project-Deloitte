import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute, RoleRoute } from "@/components/auth/AdminRoute";
import { Navbar } from "@/components/layout/Navbar";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";
import { pageTransition } from "@/lib/animations";

const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyOtpPage = lazy(() => import("@/pages/auth/VerifyOtpPage"));
const ForgetPasswordPage = lazy(() => import("@/pages/auth/ForgetPasswordPage"));
const SuccessMessagePage = lazy(() => import("@/pages/auth/SuccessMessagePage"));
const Profile = lazy(() => import("@/pages/profile/Profile"));
const Event = lazy(() => import("@/pages/events/Events"));
const EventDetails = lazy(() => import("@/pages/events/EventDetails"));
const Bookings = lazy(() => import("@/pages/bookings/bookings"));
const Venues = lazy(() => import("@/pages/venues/Venues"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminVenues = lazy(() => import("@/pages/admin/AdminVenues"));
const AdminVendors = lazy(() => import("@/pages/admin/AdminVendors"));
const AdminAttendees = lazy(() => import("@/pages/admin/AdminAttendees"));
const AdminBudget = lazy(() => import("@/pages/admin/AdminBudget"));

function App() {
  const location = useLocation();
  const isLandingRoute = location.pathname === "/";

  return (
    <div className="app-shell">
      <Navbar />
      <Suspense fallback={<RouteLoadingFallback message="Loading page..." />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${location.pathname}${location.search}`}
            className={isLandingRoute ? "" : "pt-24 sm:pt-28"}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Routes location={location}>
              <Route path='/' element={<LandingPage />} />
              <Route path='/auth' element={<AuthPage />} />
              <Route path='/reset-password' element={<ResetPasswordPage />} />
              <Route path='/verify-otp' element={<VerifyOtpPage />} />
              <Route path='/forget-password' element={<ForgetPasswordPage />} />
              <Route path='/success-message' element={<SuccessMessagePage />} />
              <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path='/events' element={<Event />} />
              <Route path='/events/:id' element={<EventDetails />} />
              <Route path='/venues' element={<ProtectedRoute><Venues /></ProtectedRoute>} />
              <Route path='/my-bookings' element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path='/bookings' element={<Navigate to='/my-bookings' replace />} />

              <Route path='/admin' element={<ProtectedRoute><RoleRoute allowedRoles={["admin", "vendor"]}><Navigate to='/admin/dashboard' replace /></RoleRoute></ProtectedRoute>} />
              <Route path='/admin/dashboard' element={<ProtectedRoute><RoleRoute allowedRoles={["admin", "vendor"]}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
              <Route path='/admin/events' element={<ProtectedRoute><AdminRoute><AdminEvents /></AdminRoute></ProtectedRoute>} />
              <Route path='/vendor/requests' element={<ProtectedRoute><RoleRoute allowedRoles={["vendor"]}><AdminEvents /></RoleRoute></ProtectedRoute>} />
              <Route path='/admin/events/:id/attendees' element={<ProtectedRoute><AdminRoute><AdminAttendees /></AdminRoute></ProtectedRoute>} />
              <Route path='/admin/venues' element={<ProtectedRoute><AdminRoute><AdminVenues /></AdminRoute></ProtectedRoute>} />
              <Route path='/admin/vendors' element={<ProtectedRoute><AdminRoute><AdminVendors /></AdminRoute></ProtectedRoute>} />
              <Route path='/admin/budget/:eventId' element={<ProtectedRoute><RoleRoute allowedRoles={["admin", "vendor"]}><AdminBudget /></RoleRoute></ProtectedRoute>} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default App;
