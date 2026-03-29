import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import { createVenue, deleteVenue, getVenues, updateVenue } from "@/lib/events-api";
import { uploadMediaImages } from "@/lib/media-api";
import { emptyVenue } from "@/pages/admin/components/venues/adminVenues.constants";

export function useAdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState(emptyVenue);
  const [editingId, setEditingId] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deletingVenueId, setDeletingVenueId] = useState("");
  const [selectedVenueForDescription, setSelectedVenueForDescription] = useState(null);

  const loadVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      setVenues(await getVenues());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load venues."));
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyVenue);
  };

  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    resetForm();
  };

  const openCreateDialog = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  const startEdit = (venue) => {
    setEditingId(venue.id);
    setForm({
      name: venue.name || "",
      address: venue.address || "",
      capacity: String(venue.capacity || ""),
      description: venue.description || "",
      imageUrls: Array.isArray(venue.imageUrls) ? venue.imageUrls : [],
    });
    setIsFormDialogOpen(true);
  };

  const submitVenue = async (submitEvent) => {
    submitEvent.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (isUploadingImages) {
      toast.error("Please wait for images to finish uploading.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: String(form.name || "").trim(),
      address: String(form.address || "").trim(),
      description: String(form.description || "").trim(),
      capacity: Number(form.capacity),
      imageUrls: form.imageUrls,
    };

    if (!payload.name || !Number.isFinite(payload.capacity) || payload.capacity < 1) {
      toast.error("Please enter a valid venue name and capacity.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateVenue(editingId, payload);
        toast.success("Venue updated.");
      } else {
        await createVenue(payload);
        toast.success("Venue created.");
      }

      closeFormDialog();
      await loadVenues();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save venue."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadVenueImages = async (files) => {
    if (!files?.length) return;

    setIsUploadingImages(true);
    try {
      const uploaded = await uploadMediaImages(files, "venues");
      const nextUrls = uploaded
        .map((image) => image?.url)
        .filter((url) => typeof url === "string" && url.trim());

      setForm((previous) => ({
        ...previous,
        imageUrls: [...new Set([...(previous.imageUrls || []), ...nextUrls])],
      }));
      toast.success("Venue images uploaded.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload venue images."));
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageUpload = async (inputEvent) => {
    await uploadVenueImages(inputEvent.target.files);
    inputEvent.target.value = "";
  };

  const handleImageDrop = async (files) => {
    await uploadVenueImages(files);
  };

  const removeImageAtIndex = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: (previous.imageUrls || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeVenue = async (venueId) => {
    if (deletingVenueId === venueId) {
      return;
    }

    setDeletingVenueId(venueId);
    try {
      await deleteVenue(venueId);
      toast.success("Venue deleted.");
      await loadVenues();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete venue."));
    } finally {
      setDeletingVenueId("");
    }
  };

  return {
    closeFormDialog,
    deletingVenueId,
    editingId,
    form,
    handleImageDrop,
    handleImageUpload,
    isFormDialogOpen,
    isLoading,
    isSubmitting,
    isUploadingImages,
    openCreateDialog,
    removeImageAtIndex,
    removeVenue,
    resetForm,
    setForm,
    setSelectedVenueForDescription,
    setIsFormDialogOpen,
    selectedVenueForDescription,
    startEdit,
    submitVenue,
    venues,
  };
}
