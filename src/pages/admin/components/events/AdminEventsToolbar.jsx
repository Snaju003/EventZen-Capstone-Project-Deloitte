import { EventStatusFilterPills } from "@/pages/admin/components/EventStatusFilterPills";

export function AdminEventsToolbar({
  eventCounts,
  onCreate,
  onSearchChange,
  onStatusChange,
  searchTerm,
  statusFilter,
}) {
  return (
    <section className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-slate-600">
          Create and edit events in a dialog without leaving this page.
        </p>
        <div className="flex flex-wrap gap-3">
          <label htmlFor="admin-events-search" className="sr-only">Search events</label>
          <input
            id="admin-events-search"
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title, description, or venue"
            className="h-10 min-w-72 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2"
          />
          <EventStatusFilterPills
            statusFilter={statusFilter}
            onStatusChange={onStatusChange}
            eventCounts={eventCounts}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
      >
        Create Event
      </button>
    </section>
  );
}
