import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute, RoleRoute } from "@/components/auth/AdminRoute";
import { Navbar } from "@/components/layout/Navbar";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";

const AuthPage = lazy(() => import("@/pages/auth/AuthPage"));
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
  return (
    <>
      <Navbar />
      <Suspense fallback={<RouteLoadingFallback message="Loading page..." />}>
        <Routes>
          <Route path='/' element={<AuthPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/verify-otp' element={<VerifyOtpPage />} />
          <Route path='/forget-password' element={<ForgetPasswordPage />} />
          <Route path='/success-message' element={<SuccessMessagePage />} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/events' element={<ProtectedRoute><Event /></ProtectedRoute>} />
          <Route path='/events/:id' element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
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
      </Suspense>
    </>
  );
}

export default App;
