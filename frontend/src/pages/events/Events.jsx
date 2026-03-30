import { Search } from "lucide-react";
import { motion } from "framer-motion";

import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCardGrid } from "@/components/ui/SkeletonCard";
import { staggerContainer } from "@/lib/animations";
import { EventsFiltersPanel } from "@/pages/events/components/EventsFiltersPanel";
import { EventsPaginationBar } from "@/pages/events/components/EventsPaginationBar";
import { PublishedEventCard } from "@/pages/events/components/PublishedEventCard";
import { useEventsPage } from "@/pages/events/hooks/useEventsPage";

export default function Events() {
  const {
    error,
    events,
    filters,
    isLoading,
    loadEvents,
    pagination,
    resetFilters,
    setCurrentPage,
    updateFilter,
    venueMap,
    venues,
  } = useEventsPage();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-4rem] top-28 h-44 w-44 bg-sky-300/20" />
      <div className="soft-orb right-[-3rem] top-44 h-40 w-40 bg-amber-200/30" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Curated Experiences</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>Events</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Browse published events, compare details, and reserve your seats with confidence.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <EventsFiltersPanel
            filters={filters}
            onFilterChange={updateFilter}
            onResetFilters={resetFilters}
            venues={venues}
          />
        </motion.div>

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-300/70 bg-red-100/90 p-4 text-sm text-red-900 shadow-sm"
          >
            <p>{error}</p>
            <button type="button" onClick={loadEvents} className="focus-polish mt-2 text-sm font-semibold underline">Try again</button>
          </motion.div>
        ) : null}

        {isLoading ? (
          <SkeletonCardGrid count={8} columns="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        ) : events.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No events found"
            description="No events matched your filters. Try adjusting your search criteria."
          />
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={staggerContainer(0.06, 0)}
              initial="hidden"
              animate="show"
            >
              {events.map((event, index) => (
                <PublishedEventCard
                  key={event.id}
                  event={event}
                  index={index}
                  venue={venueMap.get(event.venueId)}
                />
              ))}
            </motion.div>

            <EventsPaginationBar
              pagination={pagination}
              onPrevious={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              onNext={() => setCurrentPage((previous) => previous + 1)}
            />
          </>
        )}
      </main>
    </div>
  );
}
