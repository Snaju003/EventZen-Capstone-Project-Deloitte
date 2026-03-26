export function EventsFiltersPanel({ filters, onFilterChange, onResetFilters, venues }) {
  const hasAnyFilter = Boolean(filters.search || filters.venueId || filters.startDate || filters.endDate);

  return (
    <section className="surface-card mb-6 grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
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
        <label htmlFor="events-venue" className="sr-only">Filter by venue</label>
        <select
          id="events-venue"
          value={filters.venueId}
          onChange={(event) => onFilterChange("venueId", event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All venues</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>{venue.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="events-start-date" className="sr-only">Start date</label>
        <input
          id="events-start-date"
          type="date"
          value={filters.startDate}
          onChange={(event) => onFilterChange("startDate", event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="events-end-date" className="sr-only">End date</label>
        <input
          id="events-end-date"
          type="date"
          value={filters.endDate}
          onChange={(event) => onFilterChange("endDate", event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="action-secondary h-11 bg-slate-100 hover:bg-slate-200 md:col-span-4"
        >
          Clear filters
        </button>
      ) : null}
    </section>
  );
}
