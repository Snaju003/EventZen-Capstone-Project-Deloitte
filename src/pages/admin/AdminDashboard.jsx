import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  RefreshCw,
  Users,
} from "lucide-react";

import { getApiErrorMessage } from "@/lib/auth-api";
import { useAuth } from "@/hooks/useAuth";
import { getEventBookingCount } from "@/lib/bookings-api";
import { formatINR } from "@/lib/currency";
import { getEvents, getVenues, getVendors } from "@/lib/events-api";

const BASE_SECTION_CONFIG = [
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "bookings", label: "Bookings", icon: Users },
  { key: "venues", label: "Venues", icon: Building2 },
  { key: "vendors", label: "Vendors", icon: BriefcaseBusiness },
];

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryCard({ title, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({});

  const sectionConfig = useMemo(() => {
    if (isAdmin) return BASE_SECTION_CONFIG;
    return BASE_SECTION_CONFIG.filter((section) => section.key !== "vendors");
  }, [isAdmin]);

  const activeSection = sectionConfig.some(
    (section) => section.key === searchParams.get("section"),
  )
    ? searchParams.get("section")
    : "events";

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [eventsResponse, venuesResponse] = await Promise.all([
        getEvents(),
        getVenues(),
      ]);

      const vendorsResponse = isAdmin ? await getVendors() : [];

      const sortedEvents = [...eventsResponse].sort((a, b) => {
        const aTime = new Date(a.startTime || 0).getTime();
        const bTime = new Date(b.startTime || 0).getTime();
        return bTime - aTime;
      });

      const bookingCountResults = await Promise.allSettled(
        sortedEvents.map((event) => getEventBookingCount(event.id)),
      );

      const nextBookingCounts = {};
      bookingCountResults.forEach((result, index) => {
        const eventId = sortedEvents[index]?.id;
        if (!eventId || result.status !== "fulfilled") return;

        const seats = Number(result.value?.confirmedSeats);
        nextBookingCounts[eventId] = Number.isFinite(seats) ? seats : 0;
      });

      setEvents(sortedEvents);
      setVenues(venuesResponse);
      setVendors(vendorsResponse);
      setBookingCounts(nextBookingCounts);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(error, "Could not load admin dashboard data."),
      );
      setEvents([]);
      setVenues([]);
      setVendors([]);
      setBookingCounts({});
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalConfirmedSeats = useMemo(
    () => Object.values(bookingCounts).reduce((sum, value) => sum + Number(value || 0), 0),
    [bookingCounts],
  );

  const statusCounts = useMemo(() => {
    return events.reduce(
      (accumulator, event) => {
        const normalized = (event.status || "draft").toLowerCase();
        if (normalized === "published") accumulator.published += 1;
        if (normalized === "draft") accumulator.draft += 1;
        if (normalized === "cancelled") accumulator.cancelled += 1;
        return accumulator;
      },
      { published: 0, draft: 0, cancelled: 0 },
    );
  }, [events]);

  const bookingRows = useMemo(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title || "Untitled event",
        status: event.status || "draft",
        startTime: event.startTime,
        maxAttendees: Number(event.maxAttendees || 0),
        confirmedSeats: Number(bookingCounts[event.id] || 0),
      })),
    [bookingCounts, events],
  );

  const handleSectionChange = (section) => {
    setSearchParams({ section }, { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{isAdmin ? "Admin Dashboard" : "Vendor Dashboard"}</h1>
            <p className="mt-1 text-slate-500">
              {isAdmin ? "Manage events, bookings, venues, and vendors from one place." : "Manage your events and budgets from one place."}
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <nav className="mb-6 flex items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
          {sectionConfig.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => handleSectionChange(section.key)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>

        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadDashboardData}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total Events" value={events.length} helper={`${statusCounts.published} published`} />
          <SummaryCard title="Total Bookings" value={totalConfirmedSeats} helper="Confirmed seats" />
          <SummaryCard title="Total Venues" value={venues.length} helper="Registered venues" />
          <SummaryCard title="Total Vendors" value={vendors.length} helper="Active vendor partners" />
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading dashboard...
          </div>
        ) : null}

        {!isLoading && activeSection === "events" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{event.title || "Untitled event"}</td>
                    <td className="px-4 py-3 capitalize">{event.status || "draft"}</td>
                    <td className="px-4 py-3">{formatDate(event.startTime)}</td>
                    <td className="px-4 py-3">{formatINR(event.ticketPrice)}</td>
                    <td className="px-4 py-3">{event.maxAttendees || 0}</td>
                  </tr>
                ))}
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No events found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && activeSection === "bookings" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Confirmed Seats</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookingRows.map((row) => (
                  <tr key={row.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3">{row.confirmedSeats}</td>
                    <td className="px-4 py-3">{row.maxAttendees}</td>
                    <td className="px-4 py-3">{formatDate(row.startTime)}</td>
                  </tr>
                ))}
                {bookingRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No booking data available.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && activeSection === "venues" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <article key={venue.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">{venue.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{venue.address}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Capacity: {venue.capacity || 0}</p>
                </div>
                <p className="mt-3 text-sm text-slate-600">{venue.description || "No venue description available."}</p>
              </article>
            ))}
            {venues.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500 md:col-span-2">
                No venues found.
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLoading && activeSection === "vendors" ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Service Type</th>
                  <th className="px-4 py-3">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="text-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-900">{vendor.name || "-"}</td>
                    <td className="px-4 py-3">{vendor.serviceType || "-"}</td>
                    <td className="px-4 py-3">{vendor.contactEmail || "-"}</td>
                  </tr>
                ))}
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No vendors found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </div>
  );
}
