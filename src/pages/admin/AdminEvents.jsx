import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { formatINR } from "@/lib/currency";
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
import { EventStatusFilterPills } from "@/pages/admin/components/EventStatusFilterPills";
import { RejectEventDialog } from "@/pages/admin/components/RejectEventDialog";

const initialForm = {
  title: "",
  description: "",
  venueId: "",
  startTime: "",
  endTime: "",
  ticketPrice: "",
  maxAttendees: "",
  imageUrls: [],
};

function toDateTimeInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

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

export default function AdminEvents() {
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
  const [form, setForm] = useState(initialForm);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageMeta, setPageMeta] = useState({
    page: 1,
    size: 9,
    total: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [eventCounts, setEventCounts] = useState({ all: 0, pending: 0, published: 0, rejected: 0, cancelled: 0 });
  const [pendingApprovalEvents, setPendingApprovalEvents] = useState([]);
  const [rejectionDialog, setRejectionDialog] = useState({
    open: false,
    eventId: "",
    eventTitle: "",
    reason: "Please update event details and resubmit.",
  });
  const [isRejecting, setIsRejecting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    const normalizedStatusFilter = statusFilter === "pending"
      ? "draft"
      : statusFilter === "all"
        ? undefined
        : statusFilter;

    try {
      const [eventsPage, venuesData] = await Promise.all([
        getEventsPage({
          status: normalizedStatusFilter,
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
        const nextCounts = { all: ownEvents.length, pending: 0, published: 0, rejected: 0, cancelled: 0 };

        ownEvents.forEach((event) => {
          const normalizedStatus = (event.status || "draft").toLowerCase();
          if (normalizedStatus === "published") nextCounts.published += 1;
          else if (normalizedStatus === "rejected") nextCounts.rejected += 1;
          else if (normalizedStatus === "cancelled") nextCounts.cancelled += 1;
          else nextCounts.pending += 1;
        });

        setEventCounts(nextCounts);
        setPendingApprovalEvents([]);
      }
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Failed to load events admin data."));
      toast.error(getApiErrorMessage(error, "Failed to load events admin data."));
      setEvents([]);
      setVenues([]);
      setVendors([]);
      setPendingApprovalEvents([]);
      setPageMeta({ page: 1, size: 9, total: 0, totalPages: 0, hasNext: false });
      setEventCounts({ all: 0, pending: 0, published: 0, rejected: 0, cancelled: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, isAdmin, searchTerm, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const venueMap = useMemo(() => {
    return new Map(venues.map((venue) => [venue.id, venue]));
  }, [venues]);

  const vendorMap = useMemo(() => {
    return new Map(vendors.map((vendor) => [vendor.id, vendor]));
  }, [vendors]);

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
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

  const handleImageUpload = async (inputEvent) => {
    const files = inputEvent.target.files;
    if (!files?.length) return;

    setUploadingImages(true);
    try {
      const uploaded = await uploadMediaImages(files, "events");
      const nextUrls = uploaded
        .map((image) => image?.url)
        .filter((url) => typeof url === "string" && url.trim());

      setForm((previous) => ({
        ...previous,
        imageUrls: [...new Set([...(previous.imageUrls || []), ...nextUrls])],
      }));
      toast.success("Event images uploaded.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload event images."));
    } finally {
      inputEvent.target.value = "";
      setUploadingImages(false);
    }
  };

  const removeImageAtIndex = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: (previous.imageUrls || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);
    const ticketPrice = Number(form.ticketPrice);
    const maxAttendees = Number(form.maxAttendees);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error("Please select valid event start and end times.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End time must be after start time.");
      return;
    }

    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      toast.error("Ticket price must be a valid positive amount.");
      return;
    }

    if (!Number.isFinite(maxAttendees) || maxAttendees < 1) {
      toast.error("Max attendees must be at least 1.");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      ticketPrice,
      maxAttendees,
      startTime: form.startTime,
      endTime: form.endTime,
      imageUrls: form.imageUrls,
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        toast.success("Event updated.");
      } else {
        await createEvent(payload);
        toast.success("Event created.");
      }
      closeFormDialog();
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save event."));
    } finally {
      setSubmitting(false);
    }
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

  const assignVendor = async (eventId) => {
    const draft = assignmentDrafts[eventId] || {};
    if (!draft.vendorId || !draft.agreedCost) {
      toast.error("Select a vendor and agreed cost first.");
      return;
    }

    await runAction(
      () => assignVendorToEvent(eventId, { vendorId: draft.vendorId, agreedCost: Number(draft.agreedCost) }),
      "Vendor assigned.",
    );
  };

  const approveSelectedVendor = async (eventId) => {
    const draft = assignmentDrafts[eventId] || {};
    if (!draft.vendorId) {
      toast.error("Select a vendor first to mark as approved.");
      return;
    }

    await runAction(
      () => approveEventVendor(eventId, draft.vendorId),
      "Approved vendor selected.",
    );
  };

  const openRejectDialog = (event) => {
    setRejectionDialog({
      open: true,
      eventId: event.id,
      eventTitle: event.title || "Untitled event",
      reason: "Please update event details and resubmit.",
    });
  };

  const closeRejectDialog = () => {
    setRejectionDialog({
      open: false,
      eventId: "",
      eventTitle: "",
      reason: "Please update event details and resubmit.",
    });
  };

  const confirmRejectEvent = async () => {
    const trimmedReason = rejectionDialog.reason.trim();
    if (!trimmedReason) {
      toast.error("Rejection reason is required.");
      return;
    }

    setIsRejecting(true);
    try {
      const wasSuccessful = await runAction(
        () => rejectEvent(rejectionDialog.eventId, trimmedReason),
        "Event request rejected.",
      );
      if (wasSuccessful) {
        closeRejectDialog();
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const previewVenue = venueMap.get(form.venueId);
  const previewImages = form.imageUrls?.length ? form.imageUrls : previewVenue?.imageUrls;
  const previewTitle = form.title?.trim() || "Untitled event";
  const previewDescription = form.description?.trim() || "No description available.";
  const previewStartTime = form.startTime ? formatDateTime(form.startTime) : "Date unavailable";
  const pageTitle = isAdmin ? "Event Management" : "My Event Requests";
  const pageSubtitle = isAdmin
    ? "Review pending requests, approve or reject them, and manage published events."
    : "Create event requests, track approval status, and update your submissions.";

  const visibleEvents = events;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
          <p className="text-slate-500">{pageSubtitle}</p>
        </div>

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
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, description, or venue"
                className="h-10 min-w-72 rounded-lg border border-slate-200 px-3 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2"
              />
              <EventStatusFilterPills
                statusFilter={statusFilter}
                onStatusChange={(nextFilter) => {
                  setStatusFilter(nextFilter);
                  setCurrentPage(1);
                }}
                eventCounts={eventCounts}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateDialog}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
          >
            Create Event
          </button>
        </section>

        {loadError ? (
          <div role="alert" className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {isAdmin ? (
          <section className="mb-8 rounded-xl border border-amber-300 bg-amber-100/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-amber-900">Approval Queue</h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900">
                {pendingApprovalEvents.length} pending
              </span>
            </div>

            {pendingApprovalEvents.length === 0 ? (
              <p className="mt-2 text-sm text-amber-800">No pending event requests right now.</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {pendingApprovalEvents.slice(0, 6).map((event) => (
                  <article key={`queue-${event.id}`} className="rounded-lg border border-amber-300 bg-white p-3">
                    <p className="font-semibold text-slate-900">{event.title || "Untitled event"}</p>
                    <p className="mt-1 text-xs text-slate-600">{venueMap.get(event.venueId)?.name || "Unknown venue"}</p>
                    <p className="text-xs text-slate-600">{formatDateTime(event.startTime)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => runAction(() => publishEvent(event.id), "Event approved and published.")}
                        aria-label={`Approve and publish ${event.title || "event"}`}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                      >
                        Approve & Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectDialog(event)}
                        aria-label={`Reject ${event.title || "event"}`}
                        className="rounded-md border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <Dialog
          open={isFormDialogOpen}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
              <DialogDescription>
                Use this form to manage event details, timing, and venue assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  aria-label="Event title"
                  value={form.title}
                  onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="Title"
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <select
                  aria-label="Venue"
                  value={form.venueId}
                  onChange={(event) => setForm((previous) => ({ ...previous, venueId: event.target.value }))}
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                >
                  <option value="">Select venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
                <textarea
                  aria-label="Event description"
                  value={form.description}
                  onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Description"
                  className="min-h-24 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
                />
                <input
                  aria-label="Event start date and time"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(event) => setForm((previous) => ({ ...previous, startTime: event.target.value }))}
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <input
                  aria-label="Event end date and time"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(event) => setForm((previous) => ({ ...previous, endTime: event.target.value }))}
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <input
                  aria-label="Ticket price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.ticketPrice}
                  onChange={(event) => setForm((previous) => ({ ...previous, ticketPrice: event.target.value }))}
                  placeholder="Ticket price"
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <input
                  aria-label="Maximum attendees"
                  type="number"
                  min="1"
                  value={form.maxAttendees}
                  onChange={(event) => setForm((previous) => ({ ...previous, maxAttendees: event.target.value }))}
                  placeholder="Max attendees"
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Event Images</label>
                  <input
                    aria-label="Upload event images"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImages || submitting}
                    className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                  />
                  <p className="mt-1 text-xs text-slate-500">Upload up to 10 images. Supported: JPG, PNG, WEBP.</p>

                  {uploadingImages ? <p className="mt-2 text-sm text-primary">Uploading images...</p> : null}

                  {form.imageUrls?.length ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {form.imageUrls.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                          <img src={url} alt={`Event upload ${index + 1}`} className="h-20 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImageAtIndex(index)}
                            aria-label={`Remove uploaded image ${index + 1}`}
                            className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-lg bg-primary px-4 font-semibold text-white disabled:bg-slate-300"
                  >
                    {submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={closeFormDialog}
                    className="h-11 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Customer Image Preview</h3>
                <p className="mt-1 text-xs text-slate-500">
                  This is how your event image and details will appear on the customer events page.
                </p>

                <article className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <ImageCarousel images={previewImages} altPrefix={previewTitle} className="mb-3 h-48" />
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900">{previewTitle}</h4>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-700">
                      {editingId ? "existing" : "draft"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{previewDescription}</p>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <p>{previewStartTime}</p>
                    <p>{previewVenue?.name || "Venue unavailable"}</p>
                    <p>{formatINR(Number(form.ticketPrice || 0))} per ticket</p>
                  </div>
                </article>
              </section>
            </div>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div role="status" aria-live="polite" className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading events...
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => {
              const normalizedStatus = (event.status || "draft").toLowerCase();
              const statusBadgeLabel = normalizedStatus === "draft"
                ? "Pending Approval"
                : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
              const statusBadgeClass = normalizedStatus === "published"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : normalizedStatus === "rejected"
                  ? "border-rose-300 bg-rose-100 text-rose-900"
                : normalizedStatus === "cancelled"
                  ? "border-red-300 bg-red-100 text-red-900"
                  : "border-amber-300 bg-amber-100 text-amber-900";

              return (
              <article key={event.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <ImageCarousel images={event.imageUrls} altPrefix={event.title || "Event"} className="mb-4 h-44" />
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{event.title || "Untitled event"}</h3>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass}`}>
                        {statusBadgeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{event.description || "No description"}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Venue: {venueMap.get(event.venueId)?.name || "Unknown"}
                    </p>
                    {normalizedStatus === "rejected" ? (
                      <p className="mt-1 text-xs font-medium text-rose-900">
                        Rejection reason: {event.rejectionReason || "No reason provided."}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEdit(event)} aria-label={`Edit ${event.title || "event"}`} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Edit</button>
                    {isAdmin && normalizedStatus === "draft" ? (
                      <button
                        type="button"
                        onClick={() => runAction(() => publishEvent(event.id), "Event approved and published.")}
                        aria-label={`Approve and publish ${event.title || "event"}`}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
                      >
                        Approve & Publish
                      </button>
                    ) : null}
                    {isAdmin && normalizedStatus === "draft" ? (
                      <button
                        type="button"
                        onClick={() => openRejectDialog(event)}
                        aria-label={`Reject ${event.title || "event"}`}
                        className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900"
                      >
                        Reject
                      </button>
                    ) : null}
                    <button type="button" onClick={() => runAction(() => cancelEvent(event.id), "Event cancelled.")} aria-label={`Cancel ${event.title || "event"}`} className="rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm text-amber-900">Cancel</button>
                    {isAdmin ? <button type="button" onClick={() => runAction(() => deleteEvent(event.id), "Event deleted.")} aria-label={`Delete ${event.title || "event"}`} className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900">Delete</button> : null}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {isAdmin ? (
                    <div className="grid grid-cols-1 gap-2">
                      <select
                        aria-label={`Select vendor for ${event.title || "event"}`}
                        value={assignmentDrafts[event.id]?.vendorId || ""}
                        onChange={(inputEvent) => {
                          const value = inputEvent.target.value;
                          setAssignmentDrafts((previous) => ({
                            ...previous,
                            [event.id]: { ...previous[event.id], vendorId: value },
                          }));
                        }}
                        className="h-10 rounded-md border border-slate-200 px-2"
                      >
                        <option value="">Select vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                        ))}
                      </select>
                      <input
                        aria-label={`Agreed vendor cost for ${event.title || "event"}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={assignmentDrafts[event.id]?.agreedCost || ""}
                        onChange={(inputEvent) => {
                          const value = inputEvent.target.value;
                          setAssignmentDrafts((previous) => ({
                            ...previous,
                            [event.id]: { ...previous[event.id], agreedCost: value },
                          }));
                        }}
                        placeholder="Agreed cost"
                        className="h-10 rounded-md border border-slate-200 px-2"
                      />
                      <button type="button" onClick={() => assignVendor(event.id)} aria-label={`Assign selected vendor to ${event.title || "event"}`} className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium">
                        Assign vendor
                      </button>
                      <button
                        type="button"
                        onClick={() => approveSelectedVendor(event.id)}
                        aria-label={`Set approved vendor for ${event.title || "event"}`}
                        className="h-10 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700"
                      >
                        Set Approved Vendor
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {isAdmin ? <Link to={`/admin/events/${event.id}/attendees`} className="inline-flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm font-medium">Attendees</Link> : null}
                    <Link to={`/admin/budget/${event.id}`} className="inline-flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm font-medium">Budget</Link>
                  </div>
                </div>

                {isAdmin && event.vendors?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.vendors.map((assigned) => (
                      <span key={assigned.vendorId} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
                        {vendorMap.get(assigned.vendorId)?.name || assigned.vendorId} ({formatINR(assigned.agreedCost)})
                        {assigned.vendorId === event.approvedVendorId ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Approved
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => runAction(() => removeVendorFromEvent(event.id, assigned.vendorId), "Vendor removed.")}
                          aria-label={`Remove vendor ${vendorMap.get(assigned.vendorId)?.name || assigned.vendorId} from ${event.title || "event"}`}
                          className="text-red-800"
                        >
                          Remove
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );})}

            {visibleEvents.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500 md:col-span-2 lg:col-span-3">
                No events found for this filter.
              </div>
            ) : null}
          </div>

          {pageMeta.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-600">
                Page {pageMeta.page} of {pageMeta.totalPages} • {pageMeta.total} events
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                  disabled={pageMeta.page <= 1 || isLoading}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((previous) => previous + 1)}
                  disabled={!pageMeta.hasNext || isLoading}
                  className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
          </>
        )}

        <RejectEventDialog
          open={rejectionDialog.open}
          eventTitle={rejectionDialog.eventTitle}
          reason={rejectionDialog.reason}
          onReasonChange={(value) => setRejectionDialog((previous) => ({ ...previous, reason: value }))}
          onCancel={closeRejectDialog}
          onConfirm={confirmRejectEvent}
          isSubmitting={isRejecting}
        />
      </main>
    </div>
  );
}
