import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/layout/Footer";
import { staggerContainer } from "@/lib/animations";
import { EventBookingPanel } from "@/pages/events/components/EventBookingPanel";
import { EventDetailsSkeleton } from "@/pages/events/components/EventDetailsSkeleton";
import { EventOverviewPanel } from "@/pages/events/components/EventOverviewPanel";
import { getCannotBookMessage, useEventDetailsPage } from "@/pages/events/hooks/useEventDetailsPage";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    availableSeats,
    canBook,
    confirmedSeats,
    error,
    event,
    handleBook,
    isAuthenticated,
    isBooking,
    isLoading,
    loadEvent,
    maxAttendees,
    seatCount,
    seatPercentage,
    setSeatCount,
  } = useEventDetailsPage(id, navigate);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-44 w-44 bg-sky-300/20" />
      <div className="soft-orb right-[-3rem] top-44 h-40 w-40 bg-amber-200/30" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex w-full max-w-5xl flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Link to="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to events
          </Link>
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900"
          >
            <p>{error}</p>
            <button type="button" onClick={loadEvent} className="focus-polish mt-2 text-sm font-semibold underline">
              Try again
            </button>
          </motion.div>
        ) : null}

        {isLoading ? (
          <EventDetailsSkeleton />
        ) : event ? (
          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            variants={staggerContainer(0.1, 0)}
            initial="hidden"
            animate="show"
          >
            <EventOverviewPanel event={event} />
            <EventBookingPanel
              availableSeats={availableSeats}
              canBook={canBook}
              confirmedSeats={confirmedSeats}
              event={event}
              eventId={id}
              handleBook={handleBook}
              isAuthenticated={isAuthenticated}
              isBooking={isBooking}
              maxAttendees={maxAttendees}
              nonBookReason={getCannotBookMessage}
              seatCount={seatCount}
              seatPercentage={seatPercentage}
              setSeatCount={setSeatCount}
            />
          </motion.div>
        ) : (
          <EmptyState
            title="Event not found"
            description="The event you're looking for doesn't exist or has been removed."
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
