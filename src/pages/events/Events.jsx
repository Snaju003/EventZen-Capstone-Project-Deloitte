import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket } from "lucide-react";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getApiErrorMessage } from "@/lib/auth-api";
import { formatINR } from "@/lib/currency";
import { getEventsPage, getVenues } from "@/lib/events-api";

const PAGE_SIZE = 8;

function formatDateTime(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    venueId: "",
    startDate: "",
    endDate: "",
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadVenues = useCallback(async () => {
    try {
      const venueData = await getVenues();
      setVenues(venueData);
    } catch {
      setVenues([]);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const pageResponse = await getEventsPage({
        status: "published",
        search: debouncedSearch || undefined,
        venueId: filters.venueId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        size: PAGE_SIZE,
        sortBy: "startTime",
        sortDir: "asc",
      });

      setEvents(pageResponse.items);
      setPagination({
        page: pageResponse.page,
        size: pageResponse.size,
        total: pageResponse.total,
        totalPages: pageResponse.totalPages,
        hasNext: pageResponse.hasNext,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Failed to load events."));
      setEvents([]);
      setPagination({
        page: 1,
        size: PAGE_SIZE,
        total: 0,
        totalPages: 0,
        hasNext: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, filters.endDate, filters.startDate, filters.venueId]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const venueMap = useMemo(() => {
    return new Map(venues.map((venue) => [venue.id, venue]));
  }, [venues]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      venueId: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Events</h1>
          <p className="mt-1 text-slate-500">Browse published events and reserve your seats.</p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
          <div>
            <label htmlFor="events-search" className="sr-only">Search events</label>
            <input
              id="events-search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search events"
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
            />
          </div>
          <div>
            <label htmlFor="events-venue" className="sr-only">Filter by venue</label>
            <select
              id="events-venue"
              value={filters.venueId}
              onChange={(event) => updateFilter("venueId", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
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
              onChange={(event) => updateFilter("startDate", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
            />
          </div>
          <div>
            <label htmlFor="events-end-date" className="sr-only">End date</label>
            <input
              id="events-end-date"
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter("endDate", event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 px-3"
            />
          </div>
          {(filters.search || filters.venueId || filters.startDate || filters.endDate) ? (
            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 md:col-span-4"
            >
              Clear filters
            </button>
          ) : null}
        </section>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{error}</p>
            <button type="button" onClick={loadEvents} className="mt-2 font-semibold underline">Retry</button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">No events matched your filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((event) => {
              const venue = venueMap.get(event.venueId);
              const eventImages = Array.isArray(event.imageUrls) && event.imageUrls.length
                ? event.imageUrls
                : venue?.imageUrls;
              return (
                <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <ImageCarousel images={eventImages} altPrefix={event.title || "Event"} className="mb-4 h-48" />
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{event.title || "Untitled event"}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{event.status || "draft"}</span>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">{event.description || "No description available."}</p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatDateTime(event.startTime)}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {venue?.name || "Venue unavailable"} - {venue?.address || ""}</p>
                    <p className="flex items-center gap-2"><Ticket className="h-4 w-4" /> {formatINR(event.ticketPrice)} per ticket</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to={`/events/${event.id}`} aria-label={`View details for ${event.title || "this event"}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                      View details
                    </Link>
                  </div>
                </article>
              );
            })}
            </div>

            {pagination.totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages} • {pagination.total} events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                    disabled={pagination.page <= 1}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((previous) => previous + 1)}
                    disabled={!pagination.hasNext}
                    className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
