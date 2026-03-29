import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import { updateBudget } from "@/lib/budget-api";
import {
  cancelEvent,
  createEvent,
  deleteEvent,
  publishEvent,
  rejectEvent,
  removeVendorFromEvent,
  toggleEventRegistration,
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
    closeFormDialog,
    editingId,
    form,
    loadData,
    publishDialog,
    rejectionDialog,
    runAction,
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

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      toast.error("Please select valid event start and end times.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End time must be after start time.");
      return;
    }

    // Validate ticket types
    const ticketTypes = (form.ticketTypes || []).filter((tt) => tt.name?.trim());
    if (ticketTypes.length === 0) {
      toast.error("Please add at least one ticket type.");
      return;
    }

    for (const tt of ticketTypes) {
      const price = Number(tt.price);
      const qty = Number(tt.maxQuantity);
      if (!Number.isFinite(price) || price < 0) {
        toast.error(`Ticket "${tt.name}" needs a valid price.`);
        return;
      }
      if (!Number.isFinite(qty) || qty < 1) {
        toast.error(`Ticket "${tt.name}" needs at least 1 available seat.`);
        return;
      }
    }

    // Admin-specific validation for vendor assignment
    if (state.isAdmin && !editingId) {
      if (!form.vendorId) {
        toast.error("Please select a vendor.");
        return;
      }
      const agreedCost = Number(form.agreedCost);
      if (!Number.isFinite(agreedCost) || agreedCost < 0) {
        toast.error("Please provide a valid agreed vendor cost.");
        return;
      }
      const totalBudget = Number(form.totalBudget);
      if (!Number.isFinite(totalBudget) || totalBudget < 0) {
        toast.error("Please provide a valid total budget.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const parsedTotalBudget = Number(form.totalBudget);
      const hasValidAdminBudget = state.isAdmin && Number.isFinite(parsedTotalBudget) && parsedTotalBudget >= 0;

      const normalizedTicketTypes = ticketTypes.map((tt) => ({
        id: tt.id || undefined,
        name: tt.name.trim(),
        description: (tt.description || "").trim(),
        price: Number(tt.price),
        maxQuantity: Number(tt.maxQuantity),
      }));

      const payload = {
        ...form,
        ticketTypes: normalizedTicketTypes,
        imageUrls: form.imageUrls,
        ...(state.isAdmin ? {
          vendorId: form.vendorId || undefined,
          agreedCost: Number(form.agreedCost) || undefined,
          totalBudget: Number(form.totalBudget) || undefined,
        } : {}),
      };
      if (editingId) {
        await updateEvent(editingId, payload);
        if (hasValidAdminBudget) {
          await updateBudget(editingId, parsedTotalBudget);
        }
        toast.success("Event updated.");
      } else {
        const createdEvent = await createEvent(payload);
        if (hasValidAdminBudget && createdEvent?.id) {
          await updateBudget(createdEvent.id, parsedTotalBudget);
        }
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
    onToggleRegistration: (eventId) => runAction(() => toggleEventRegistration(eventId), "Registration status updated."),
  };
}
