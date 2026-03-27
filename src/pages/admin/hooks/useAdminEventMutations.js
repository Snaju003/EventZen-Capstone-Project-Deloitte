import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import { updateBudget } from "@/lib/budget-api";
import {
  assignVendorToEvent,
  approveEventVendor,
  cancelEvent,
  createEvent,
  deleteEvent,
  publishEvent,
  rejectEvent,
  removeVendorFromEvent,
  updateEvent,
} from "@/lib/events-api";
import { uploadMediaImages } from "@/lib/media-api";
import {
  createDefaultPublishDialogState,
  createDefaultRejectionDialogState,
  formatDateTime,
} from "@/pages/admin/components/events/adminEvents.utils";

export function useAdminEventMutations(state) {
  const {
    assignmentDrafts,
    closeFormDialog,
    editingId,
    form,
    loadData,
    publishDialog,
    rejectionDialog,
    runAction,
    setAssignmentDrafts,
    setCurrentPage,
    setForm,
    setIsPublishing,
    setIsRejecting,
    setPublishDialog,
    setRejectionDialog,
    setSearchTerm,
    setStatusFilter,
    setSubmitting,
    setUploadingImages,
    venueMap,
  } = state;

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const uploadEventImages = async (files) => {
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
      setUploadingImages(false);
    }
  };

  const handleImageUpload = async (inputEvent) => {
    await uploadEventImages(inputEvent.target.files);
    inputEvent.target.value = "";
  };

  const handleImageDrop = async (files) => {
    await uploadEventImages(files);
  };

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();

    if (state.uploadingImages) {
      toast.error("Please wait for images to finish uploading.");
      return;
    }

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
    try {
      const payload = { ...form, ticketPrice, maxAttendees, imageUrls: form.imageUrls };
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

  const removeImageAtIndex = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: (previous.imageUrls || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const onAssignmentChange = (eventId, patch) => {
    setAssignmentDrafts((previous) => ({ ...previous, [eventId]: { ...previous[eventId], ...patch } }));
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

    await runAction(() => approveEventVendor(eventId, draft.vendorId), "Approved vendor selected.");
  };

  const openRejectDialog = (event) => {
    setRejectionDialog({ open: true, eventId: event.id, eventTitle: event.title || "Untitled event", reason: "Please update event details and resubmit." });
  };

  const closeRejectDialog = () => {
    setRejectionDialog(createDefaultRejectionDialogState());
  };

  const openPublishDialog = (event) => {
    setPublishDialog({ open: true, eventId: event.id, eventTitle: event.title || "Untitled event", totalBudget: "" });
  };

  const closePublishDialog = () => {
    setPublishDialog(createDefaultPublishDialogState());
  };

  const confirmRejectEvent = async () => {
    const reason = rejectionDialog.reason.trim();
    if (!reason) {
      toast.error("Rejection reason is required.");
      return;
    }

    setIsRejecting(true);
    try {
      const succeeded = await runAction(() => rejectEvent(rejectionDialog.eventId, reason), "Event request rejected.");
      if (succeeded) closeRejectDialog();
    } finally {
      setIsRejecting(false);
    }
  };

  const confirmApproveAndPublish = async () => {
    const parsedBudget = Number(publishDialog.totalBudget);
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      toast.error("Please provide a valid total budget.");
      return;
    }

    setIsPublishing(true);
    try {
      await updateBudget(publishDialog.eventId, parsedBudget);
      await publishEvent(publishDialog.eventId);
      toast.success("Event approved, budget set, and published.");
      closePublishDialog();
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to approve and publish event."));
    } finally {
      setIsPublishing(false);
    }
  };

  const previewVenue = venueMap.get(form.venueId);

  return {
    handleSearchChange,
    handleStatusChange,
    handleImageUpload,
    handleImageDrop,
    handleSubmit,
    removeImageAtIndex,
    onAssignmentChange,
    assignVendor,
    approveSelectedVendor,
    openRejectDialog,
    closeRejectDialog,
    openPublishDialog,
    closePublishDialog,
    confirmRejectEvent,
    confirmApproveAndPublish,
    previewVenue,
    previewImages: form.imageUrls?.length ? form.imageUrls : previewVenue?.imageUrls,
    previewTitle: form.title?.trim() || "Untitled event",
    previewDescription: form.description?.trim() || "No description available.",
    previewStartTime: form.startTime ? formatDateTime(form.startTime) : "Date unavailable",
    onCancelEvent: (eventId) => runAction(() => cancelEvent(eventId), "Event cancelled."),
    onDeleteEvent: (eventId) => runAction(() => deleteEvent(eventId), "Event deleted."),
    onRemoveVendor: (eventId, vendorId) => runAction(() => removeVendorFromEvent(eventId, vendorId), "Vendor removed."),
  };
}
