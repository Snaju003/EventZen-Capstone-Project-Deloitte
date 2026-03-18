import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getApiErrorMessage } from "@/lib/auth-api";
import { createVenue, deleteVenue, getVenues, updateVenue } from "@/lib/events-api";
import { uploadMediaImages } from "@/lib/media-api";

const emptyVenue = {
  name: "",
  address: "",
  capacity: "",
  description: "",
  imageUrls: [],
};

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState(emptyVenue);
  const [editingId, setEditingId] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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

  const submitVenue = async (submitEvent) => {
    submitEvent.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      imageUrls: form.imageUrls,
    };

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

  const handleImageUpload = async (inputEvent) => {
    const files = inputEvent.target.files;
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
      inputEvent.target.value = "";
      setIsUploadingImages(false);
    }
  };

  const removeImageAtIndex = (indexToRemove) => {
    setForm((previous) => ({
      ...previous,
      imageUrls: (previous.imageUrls || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeVenue = async (venueId) => {
    try {
      await deleteVenue(venueId);
      toast.success("Venue deleted.");
      await loadVenues();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to delete venue."));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Admin Venues</h1>
          <p className="mt-1 text-slate-500">Create, edit, and remove venue records.</p>
        </div>

        <section className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Create and edit venues in a dialog without leaving the list.
          </p>
          <button
            type="button"
            onClick={openCreateDialog}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white"
          >
            Create Venue
          </button>
        </section>

        <Dialog
          open={isFormDialogOpen}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Venue" : "Create Venue"}</DialogTitle>
              <DialogDescription>
                Use this form to manage venue details and images.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submitVenue} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={form.name}
                onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                placeholder="Venue name"
                className="h-11 rounded-lg border border-slate-200 px-3"
                required
              />
              <input
                value={form.capacity}
                onChange={(event) => setForm((previous) => ({ ...previous, capacity: event.target.value }))}
                placeholder="Capacity"
                type="number"
                min="1"
                className="h-11 rounded-lg border border-slate-200 px-3"
                required
              />
              <input
                value={form.address}
                onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
                placeholder="Address"
                className="h-11 rounded-lg border border-slate-200 px-3 md:col-span-2"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Description"
                className="min-h-20 rounded-lg border border-slate-200 px-3 py-2 md:col-span-2"
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Venue Images</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  disabled={isUploadingImages || isSubmitting}
                  className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
                <p className="mt-1 text-xs text-slate-500">Upload up to 10 images. Supported: JPG, PNG, WEBP.</p>

                {isUploadingImages ? <p className="mt-2 text-sm text-primary">Uploading images...</p> : null}

                {form.imageUrls?.length ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {form.imageUrls.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                        <img src={url} alt={`Venue upload ${index + 1}`} className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImageAtIndex(index)}
                          className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={isSubmitting} className="h-11 rounded-lg bg-primary px-4 font-semibold text-white disabled:bg-slate-300">
                  {isSubmitting ? "Saving..." : editingId ? "Update Venue" : "Create Venue"}
                </button>
                <button type="button" onClick={closeFormDialog} className="h-11 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Loading venues...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <article key={venue.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <ImageCarousel images={venue.imageUrls} altPrefix={venue.name || "Venue"} className="mb-4 h-44" />
                <h3 className="text-lg font-bold text-slate-900">{venue.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{venue.address}</p>
                <p className="mt-2 text-sm text-slate-700">Capacity: {venue.capacity || 0}</p>
                <p className="mt-2 text-sm text-slate-600">{venue.description || "No description"}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => startEdit(venue)} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">Edit</button>
                  <button type="button" onClick={() => removeVenue(venue.id)} className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900">Delete</button>
                </div>
              </article>
            ))}
            {venues.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500 md:col-span-2">
                No venues available.
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
