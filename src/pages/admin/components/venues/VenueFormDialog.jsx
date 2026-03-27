import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VenueFormDialog({
  editingId,
  form,
  isOpen,
  isSubmitting,
  isUploadingImages,
  onClose,
  onImageDrop,
  onImageUpload,
  onOpenChange,
  onRemoveImage,
  onSubmit,
  setForm,
}) {
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsDragActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const preventBrowserFileOpen = (event) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", preventBrowserFileOpen);
    window.addEventListener("drop", preventBrowserFileOpen);

    return () => {
      window.removeEventListener("dragover", preventBrowserFileOpen);
      window.removeEventListener("drop", preventBrowserFileOpen);
    };
  }, [isOpen]);

  const handleDragOver = (event) => {
    event.preventDefault();
    if (isUploadingImages || isSubmitting) {
      return;
    }
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);

    if (isUploadingImages || isSubmitting) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files?.length) {
      return;
    }

    await onImageDrop(files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`relative z-[70] max-h-[90vh] overflow-y-auto bg-white sm:max-w-3xl ${isDragActive ? "ring-2 ring-primary/50" : ""}`}
      >
        <div
          className="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragActive ? (
            <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/70 bg-primary/10">
              <p className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-primary shadow-sm">Drop images anywhere in this dialog to upload</p>
            </div>
          ) : null}

          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Venue" : "Create Venue"}</DialogTitle>
            <DialogDescription>
              Use this form to manage venue details and images.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Venue name"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3"
            required
          />

          <input
            value={form.capacity}
            onChange={(event) => setForm((previous) => ({ ...previous, capacity: event.target.value }))}
            placeholder="Capacity"
            type="number"
            min="1"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3"
            required
          />

          <input
            value={form.address}
            onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
            placeholder="Address"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 md:col-span-2"
            required
          />

          <textarea
            value={form.description}
            onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
            placeholder="Description"
            className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 md:col-span-2"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Venue Images</label>
            <div className={`rounded-lg border-2 border-dashed p-3 transition-all ${isDragActive ? "border-primary bg-primary/8 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]" : "border-slate-300 bg-slate-50/60"}`}>
              <div className="mb-2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                Drag & Drop Enabled
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={onImageUpload}
                disabled={isUploadingImages || isSubmitting}
                className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-50 file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              <p className="mt-2 text-xs font-semibold text-slate-700">Tip: You can also drop images anywhere inside the dialog.</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Upload up to 10 images. Supported: JPG, PNG, WEBP.</p>

            {isUploadingImages ? <p className="mt-2 text-sm text-primary">Uploading images...</p> : null}

            {form.imageUrls?.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {form.imageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img src={url} alt={`Venue upload ${index + 1}`} className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
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
            <button type="submit" disabled={isSubmitting || isUploadingImages} className="h-11 rounded-lg bg-primary px-4 font-semibold text-white disabled:bg-slate-300">
              {isSubmitting ? "Saving..." : isUploadingImages ? "Uploading images..." : editingId ? "Update Venue" : "Create Venue"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploadingImages}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
