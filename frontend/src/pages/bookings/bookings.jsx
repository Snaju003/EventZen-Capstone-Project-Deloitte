import { Suspense, lazy } from "react";
import { CalendarOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/ui/SkeletonCard";
import { staggerContainer } from "@/lib/animations";
import { BookingCard } from "@/pages/bookings/components/BookingCard";
import { useBookingsPage } from "@/pages/bookings/hooks/useBookingsPage";

const BookingTicketDialog = lazy(() =>
  import("@/pages/bookings/components/BookingTicketDialog").then((m) => ({ default: m.BookingTicketDialog }))
);

export default function Bookings() {
  const {
    activeTab,
    cancellingId,
    handleCancel,
    handleDownloadTicketPdf,
    handleDownloadTicketPng,
    handleViewTicket,
    isDownloadingTicket,
    isGeneratingQr,
    isLoading,
    loadBookings,
    loadError,
    selectedTicket,
    setActiveTab,
    setSelectedTicket,
    ticketQrCodeUrl,
    visibleBookings,
  } = useBookingsPage();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-28 h-48 w-48 bg-sky-300/20" />
      <div className="soft-orb right-[-3rem] top-40 h-40 w-40 bg-amber-200/30" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Your Reservations</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>My Bookings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Manage your event reservations and history.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
          className="mb-6 flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur"
        >
          {["upcoming", "past"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`relative z-10 rounded-lg px-4 py-2 text-sm transition-colors ${activeTab === tab ? "font-bold text-slate-800" : "font-medium text-slate-500 hover:text-slate-700"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "upcoming" ? "Upcoming" : "Past Events"}
              {activeTab === tab ? (
                <motion.div
                  layoutId="bookings-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-slate-100"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              ) : null}
            </button>
          ))}
        </motion.div>

        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button type="button" onClick={loadBookings} className="mt-2 text-sm font-semibold underline">Try again</button>
          </div>
        ) : null}

        {isLoading ? (
          <SkeletonCardGrid count={3} columns="grid-cols-1" />
        ) : visibleBookings.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="grid gap-5"
              variants={staggerContainer(0.06, 0)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
            >
              {visibleBookings.map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={index}
                  isCancelling={cancellingId === booking.id}
                  onCancel={handleCancel}
                  onViewTicket={handleViewTicket}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <EmptyState
            icon={CalendarOff}
            title={`No ${activeTab} bookings`}
            description={activeTab === "upcoming" ? "You don't have any upcoming bookings yet." : "No past bookings found."}
          />
        )}
      </main>

      <Suspense fallback={null}>
        <BookingTicketDialog
          isDownloadingTicket={isDownloadingTicket}
          isGeneratingQr={isGeneratingQr}
          onClose={() => setSelectedTicket(null)}
          onDownloadPdf={handleDownloadTicketPdf}
          onDownloadPng={handleDownloadTicketPng}
          selectedTicket={selectedTicket}
          ticketQrCodeUrl={ticketQrCodeUrl}
        />
      </Suspense>
    </div>
  );
}
