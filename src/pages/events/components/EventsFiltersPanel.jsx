import CustomCalendar from "@/components/ui/CustomCalendar";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { motion } from "framer-motion";

export function EventsFiltersPanel({ filters, onFilterChange, onResetFilters, venues }) {
  const hasAnyFilter = Boolean(filters.search || filters.venueId || filters.startDate || filters.endDate || (filters.sortDir && filters.sortDir !== "asc"));
  const venueOptions = [
    { value: "", label: "All venues" },
    ...venues.map((venue) => ({ value: venue.id, label: venue.name })),
  ];

  const sortOptions = [
    { value: "asc", label: "Date: Earliest first" },
    { value: "desc", label: "Date: Latest first" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="surface-card relative z-30 mb-6 grid grid-cols-1 gap-3 overflow-visible p-4 md:grid-cols-5"
    >
      <div>
        <label htmlFor="events-search" className="sr-only">Search events</label>
        <input
          id="events-search"
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
          placeholder="Search events"
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="events-venue-dropdown" className="sr-only">Filter by venue</label>
        <CustomDropdown
          id="events-venue-dropdown"
          placeholder="All venues"
          options={venueOptions}
          value={filters.venueId}
          onChange={(value) => onFilterChange("venueId", value)}
        />
      </div>

      <div>
        <label htmlFor="events-start-date" className="sr-only">Start date</label>
        <CustomCalendar
          id="events-start-date"
          value={filters.startDate}
          onChange={(value) => onFilterChange("startDate", value)}
        />
      </div>

      <div>
        <label htmlFor="events-end-date" className="sr-only">End date</label>
        <CustomCalendar
          id="events-end-date"
          value={filters.endDate}
          onChange={(value) => onFilterChange("endDate", value)}
        />
      </div>

      <div>
        <label htmlFor="events-sort-dropdown" className="sr-only">Sort events</label>
        <CustomDropdown
          id="events-sort-dropdown"
          placeholder="Sort by"
          options={sortOptions}
          value={filters.sortDir || "asc"}
          onChange={(value) => onFilterChange("sortDir", value)}
        />
      </div>

      {hasAnyFilter ? (
        <motion.button
          type="button"
          onClick={onResetFilters}
          className="action-secondary h-11 bg-slate-100 hover:bg-slate-200 md:col-span-5"
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
        >
          Clear filters
        </motion.button>
      ) : null}
    </motion.section>
  );
}
