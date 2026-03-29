import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getEventsPage, getVenues } from "@/lib/events-api";

const PAGE_SIZE = 8;

const defaultPagination = {
  page: 1,
  size: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNext: false,
};

const defaultFilters = {
  search: "",
  venueId: "",
  startDate: "",
  endDate: "",
  sortDir: "asc",
};

export function useEventsPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [pagination, setPagination] = useState(defaultPagination);
  const [filters, setFilters] = useState(defaultFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(filters.search.trim(), 300);

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
        sortDir: filters.sortDir || "asc",
      });

      const sortedItems = [...pageResponse.items].sort((a, b) => {
        const aOpen = a.registrationOpen ? 1 : 0;
        const bOpen = b.registrationOpen ? 1 : 0;
        return bOpen - aOpen;
      });

      setEvents(sortedItems);
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
      setPagination(defaultPagination);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, filters.endDate, filters.sortDir, filters.startDate, filters.venueId]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const venueMap = useMemo(() => new Map(venues.map((venue) => [venue.id, venue])), [venues]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  return {
    currentPage,
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
  };
}
