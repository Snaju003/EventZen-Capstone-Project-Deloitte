import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { SkeletonCardGrid } from "@/components/ui/SkeletonCard";
import { useAuth } from "@/hooks/useAuth";
import { BookingsTableSection } from "@/pages/admin/components/dashboard/BookingsTableSection";
import { DashboardSectionTabs } from "@/pages/admin/components/dashboard/DashboardSectionTabs";
import { DashboardSummaryCard } from "@/pages/admin/components/dashboard/DashboardSummaryCard";
import { EventsTableSection } from "@/pages/admin/components/dashboard/EventsTableSection";
import { VenuesGridSection } from "@/pages/admin/components/dashboard/VenuesGridSection";
import { VendorsTableSection } from "@/pages/admin/components/dashboard/VendorsTableSection";
import { useAdminDashboardData } from "@/pages/admin/hooks/useAdminDashboardData";

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    bookingRows,
    events,
    isLoading,
    loadDashboardData,
    loadError,
    sectionConfig,
    statusCounts,
    totalConfirmedSeats,
    venues,
    vendors,
  } = useAdminDashboardData(isAdmin);

  const activeSection = useMemo(() => {
    const requestedSection = searchParams.get("section");
    const hasRequestedSection = sectionConfig.some((section) => section.key === requestedSection);
    return hasRequestedSection ? requestedSection : "events";
  }, [searchParams, sectionConfig]);

  const handleSectionChange = (section) => {
    setSearchParams({ section }, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-48 w-48 bg-sky-300/20" />
      <div className="soft-orb right-[-4rem] top-36 h-44 w-44 bg-cyan-200/25" style={{ animationDelay: "1.1s" }} />

      <main className="page-shell flex-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="section-kicker">Control Center</p>
            <h1 className="section-title">{isAdmin ? "Admin Dashboard" : "Vendor Dashboard"}</h1>
            <p className="mt-1 text-slate-600">
              {isAdmin
                ? "Manage events, bookings, venues, and vendors from one place."
                : "Manage your events and budgets from one place."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadDashboardData({ force: true })}
            className="button-polish focus-polish inline-flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="hero-gradient-panel mb-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Operations Overview</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {isAdmin
              ? "Track live event operations, venue inventory, and vendor readiness in one control surface."
              : "Monitor your event pipeline, bookings, and budget performance from one workspace."}
          </p>
        </motion.section>

        <DashboardSectionTabs
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          sectionConfig={sectionConfig}
        />

        {loadError ? (
          <div className="mb-6 rounded-xl border border-red-300/70 bg-red-100/90 p-4 text-sm text-red-900 shadow-sm">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={() => loadDashboardData({ force: true })}
              className="focus-polish mt-2 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardSummaryCard title="Total Events" value={events.length} helper={`${statusCounts.published} published`} delay={0} />
          <DashboardSummaryCard title="Total Bookings" value={totalConfirmedSeats} helper="Confirmed seats" delay={0.08} />
          <DashboardSummaryCard title="Total Venues" value={venues.length} helper="Registered venues" delay={0.16} />
          <DashboardSummaryCard title="Total Vendors" value={vendors.length} helper="Active vendor partners" delay={0.24} />
        </div>

        {isLoading ? <SkeletonCardGrid count={2} columns="md:grid-cols-2" /> : null}

        <EventsTableSection events={events} isActive={activeSection === "events"} isLoading={isLoading} />
        <BookingsTableSection bookingRows={bookingRows} isActive={activeSection === "bookings"} isLoading={isLoading} />
        <VenuesGridSection venues={venues} isActive={activeSection === "venues"} isLoading={isLoading} />
        <VendorsTableSection vendors={vendors} isActive={activeSection === "vendors"} isLoading={isLoading} />
      </main>

      <Footer />
    </div>
  );
}
