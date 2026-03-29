import { useCallback, useEffect, useMemo, useState } from "react";

import { getApiErrorMessage } from "@/lib/auth-api";
import { getEventBookingCounts } from "@/lib/bookings-api";
import { getEvents, getVenues, getVendors } from "@/lib/events-api";
import { BASE_SECTION_CONFIG } from "@/pages/admin/components/dashboard/dashboard.constants";

let dashboardDataCache = null;
let dashboardDataInFlight = null;

async function fetchDashboardSnapshot(isAdmin) {
  const [eventsResponse, venuesResponse] = await Promise.all([getEvents(), getVenues()]);
  const vendorsResponse = isAdmin ? await getVendors() : [];

  const sortedEvents = [...eventsResponse].sort((a, b) => {
    const aTime = new Date(a.startTime || 0).getTime();
    const bTime = new Date(b.startTime || 0).getTime();
    return bTime - aTime;
  });

  const eventIds = sortedEvents
    .map((event) => event.id)
    .filter((eventId) => typeof eventId === "string" && eventId.trim());

  let rawCounts = {};
  try {
    rawCounts = await getEventBookingCounts(eventIds);
  } catch {
    rawCounts = {};
  }

  const bookingCounts = eventIds.reduce((accumulator, eventId) => {
    const seats = Number(rawCounts[eventId] || 0);
    accumulator[eventId] = Number.isFinite(seats) ? seats : 0;
    return accumulator;
  }, {});

  return {
    isAdmin,
    events: sortedEvents,
    venues: venuesResponse,
    vendors: vendorsResponse,
    bookingCounts,
  };
}

export function useAdminDashboardData(isAdmin) {
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

  const loadDashboardData = useCallback(async (options = {}) => {
    const shouldForce = Boolean(options?.force);
    setIsLoading(true);
    setLoadError("");

    try {
      if (!shouldForce && dashboardDataCache?.isAdmin === isAdmin) {
        setEvents(dashboardDataCache.events);
        setVenues(dashboardDataCache.venues);
        setVendors(dashboardDataCache.vendors);
        setBookingCounts(dashboardDataCache.bookingCounts);
        return;
      }

      if (!shouldForce && dashboardDataInFlight) {
        const sharedSnapshot = await dashboardDataInFlight;
        setEvents(sharedSnapshot.events);
        setVenues(sharedSnapshot.venues);
        setVendors(sharedSnapshot.vendors);
        setBookingCounts(sharedSnapshot.bookingCounts);
        return;
      }

      dashboardDataInFlight = fetchDashboardSnapshot(isAdmin);
      const snapshot = await dashboardDataInFlight;
      dashboardDataCache = snapshot;

      setEvents(snapshot.events);
      setVenues(snapshot.venues);
      setVendors(snapshot.vendors);
      setBookingCounts(snapshot.bookingCounts);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Could not load admin dashboard data."));
      setEvents([]);
      setVenues([]);
      setVendors([]);
      setBookingCounts({});
    } finally {
      dashboardDataInFlight = null;
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

  const statusCounts = useMemo(
    () => events.reduce(
      (accumulator, event) => {
        const normalized = (event.status || "draft").toLowerCase();
        if (normalized === "published") accumulator.published += 1;
        if (normalized === "draft") accumulator.draft += 1;
        if (normalized === "cancelled") accumulator.cancelled += 1;
        return accumulator;
      },
      { published: 0, draft: 0, cancelled: 0 },
    ),
    [events],
  );

  const bookingRows = useMemo(
    () => events.map((event) => ({
      id: event.id,
      title: event.title || "Untitled event",
      status: event.status || "draft",
      startTime: event.startTime,
      maxAttendees: Number(event.maxAttendees || 0),
      confirmedSeats: Number(bookingCounts[event.id] || 0),
    })),
    [bookingCounts, events],
  );

  return {
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
  };
}
