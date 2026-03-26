import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { updateBudget } from "@/lib/budget-api";
import {
  assignVendorToEvent,
  approveEventVendor,
  cancelEvent,
  createEvent,
  deleteEvent,
  getEvents,
  getEventsPage,
  getVenues,
  getVendors,
  publishEvent,
  rejectEvent,
  removeVendorFromEvent,
  updateEvent,
} from "@/lib/events-api";
import { uploadMediaImages } from "@/lib/media-api";
import {
  createDefaultPublishDialogState,
  createDefaultRejectionDialogState,
  emptyEventCounts,
  emptyPageMeta,
  initialEventForm,
  toDateTimeInputValue,
} from "@/pages/admin/components/events/adminEvents.utils";

function normalizeStatusFilter(statusFilter) {
  if (statusFilter === "pending") return "draft";
  if (statusFilter === "all") return undefined;
  return statusFilter;
}

function buildEventCountsFromOwnEvents(events) {
  const counts = { all: events.length, pending: 0, published: 0, rejected: 0, cancelled: 0 };

  events.forEach((event) => {
    const status = (event.status || "draft").toLowerCase();
    if (status === "published") counts.published += 1;
    else if (status === "rejected") counts.rejected += 1;
    else if (status === "cancelled") counts.cancelled += 1;
    else counts.pending += 1;
  });

  return counts;
}

export function useAdminEventsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [form, setForm] = useState(initialEventForm);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMeta, setPageMeta] = useState(emptyPageMeta);
  const [eventCounts, setEventCounts] = useState(emptyEventCounts);
  const [pendingApprovalEvents, setPendingApprovalEvents] = useState([]);
  const [rejectionDialog, setRejectionDialog] = useState(createDefaultRejectionDialogState());
  const [isRejecting, setIsRejecting] = useState(false);
  const [publishDialog, setPublishDialog] = useState(createDefaultPublishDialogState());
  const [isPublishing, setIsPublishing] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [eventsPage, venuesData] = await Promise.all([
        getEventsPage({
          status: normalizeStatusFilter(statusFilter),
          search: searchTerm.trim() || undefined,
          page: currentPage,
          size: 9,
          sortBy: "startTime",
          sortDir: "desc",
        }),
        getVenues(),
      ]);

      setEvents(Array.isArray(eventsPage?.items) ? eventsPage.items : []);
      setPageMeta({
        page: Number(eventsPage?.page) || currentPage,
        size: Number(eventsPage?.size) || 9,
        total: Number(eventsPage?.total) || 0,
        totalPages: Number(eventsPage?.totalPages) || 0,
        hasNext: Boolean(eventsPage?.hasNext),
      });
      setVenues(venuesData);

      if (isAdmin) {
        const [vendorsData, countAll, countPending, countPublished, countRejected, countCancelled, pendingQueue] = await Promise.all([
          getVendors(),
          getEventsPage({ page: 1, size: 1, sortBy: "startTime", sortDir: "desc" }),
          getEventsPage({ status: "draft", page: 1, size: 1, sortBy: "startTime", sortDir: "desc" }),
          getEventsPage({ status: "published", page: 1, size: 1, sortBy: "startTime", sortDir: "desc" }),
          getEventsPage({ status: "rejected", page: 1, size: 1, sortBy: "startTime", sortDir: "desc" }),
          getEventsPage({ status: "cancelled", page: 1, size: 1, sortBy: "startTime", sortDir: "desc" }),
          getEventsPage({ status: "draft", page: 1, size: 6, sortBy: "startTime", sortDir: "asc" }),
        ]);

        setVendors(vendorsData);
        setEventCounts({
          all: Number(countAll?.total) || 0,
          pending: Number(countPending?.total) || 0,
          published: Number(countPublished?.total) || 0,
          rejected: Number(countRejected?.total) || 0,
          cancelled: Number(countCancelled?.total) || 0,
        });
        setPendingApprovalEvents(Array.isArray(pendingQueue?.items) ? pendingQueue.items : []);
      } else {
        setVendors([]);
        const ownEvents = await getEvents();
        setEventCounts(buildEventCountsFromOwnEvents(ownEvents));
        setPendingApprovalEvents([]);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, "Failed to load events admin data.");
      setLoadError(message);
      toast.error(message);
      setEvents([]);
      setVenues([]);
      setVendors([]);
      setPendingApprovalEvents([]);
      setPageMeta(emptyPageMeta);
      setEventCounts(emptyEventCounts);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isAdmin, searchTerm, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const venueMap = useMemo(() => new Map(venues.map((venue) => [venue.id, venue])), [venues]);
  const vendorMap = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors]);

  const resetForm = () => {
    setEditingId("");
    setForm(initialEventForm);
  };

  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    resetForm();
  };

  const openCreateDialog = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      venueId: event.venueId || "",
      startTime: toDateTimeInputValue(event.startTime),
      endTime: toDateTimeInputValue(event.endTime),
      ticketPrice: String(event.ticketPrice ?? ""),
      maxAttendees: String(event.maxAttendees ?? ""),
      imageUrls: Array.isArray(event.imageUrls) ? event.imageUrls : [],
    });
    setIsFormDialogOpen(true);
  };

  const runAction = async (action, successMessage) => {
    try {
      await action();
      toast.success(successMessage);
      await loadData();
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Action failed."));
      return false;
    }
  };

  return {
    isAdmin,
    events,
    venues,
    vendors,
    isLoading,
    loadError,
    submitting,
    uploadingImages,
    editingId,
    isFormDialogOpen,
    form,
    assignmentDrafts,
    statusFilter,
    searchTerm,
    currentPage,
    pageMeta,
    eventCounts,
    pendingApprovalEvents,
    rejectionDialog,
    isRejecting,
    publishDialog,
    isPublishing,
    venueMap,
    vendorMap,
    setSubmitting,
    setUploadingImages,
    setIsFormDialogOpen,
    setForm,
    setAssignmentDrafts,
    setStatusFilter,
    setSearchTerm,
    setCurrentPage,
    setRejectionDialog,
    setIsRejecting,
    setPublishDialog,
    setIsPublishing,
    loadData,
    resetForm,
    closeFormDialog,
    openCreateDialog,
    startEdit,
    runAction,
  };
}
