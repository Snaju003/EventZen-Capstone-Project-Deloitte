import { useState } from "react";
import { Building2, CloudUpload, Hash, MapPin, Sparkles, X } from "lucide-react";

import { generateVenueDescription } from "@/lib/events-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function FieldLabel({ icon: Icon, label, hint, required }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </span>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function SectionDivider({ title }) {
  return (
    <div className="md:col-span-2">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    </div>
  );
}

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const handleDragOver = (event) => {
    event.preventDefault();
    if (isUploadingImages || isSubmitting) return;
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragActive(false);
    if (isUploadingImages || isSubmitting) return;

    const files = event.dataTransfer?.files;
    if (!files?.length) return;

    await onImageDrop(files);
  };

  const handleGenerateDescription = async () => {
    if (!form.name?.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const description = await generateVenueDescription(form.name.trim());
      setForm((previous) => ({ ...previous, description }));
    } catch (error) {
      setGenerateError("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="relative z-[70] max-h-[90vh] overflow-y-auto bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            {editingId ? "Edit Venue" : "Create Venue"}
          </DialogTitle>
          <DialogDescription>
            Define the venue's details, location, and upload photos to help organisers choose the perfect space.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SectionDivider title="Basic Details" />

          <div className="flex flex-col gap-1">
            <FieldLabel icon={Building2} label="Venue Name" hint="The official name of the space" required />
            <input
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              placeholder="e.g. Grand Ballroom"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <FieldLabel icon={Hash} label="Capacity" hint="Maximum number of guests" required />
            <input
              value={form.capacity}
              onChange={(event) => setForm((previous) => ({ ...previous, capacity: event.target.value }))}
              placeholder="e.g. 500"
              type="number"
              min="1"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <FieldLabel icon={MapPin} label="Address" hint="Full street address of the venue" required />
            <input
              value={form.address}
              onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
              placeholder="e.g. 123 Event Avenue, Downtown District"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <SectionDivider title="Description" />

          <div className="flex flex-col gap-1 md:col-span-2">
            <div className="flex items-end justify-between gap-2">
              <FieldLabel label="Description" hint="Describe the venue's atmosphere and amenities" />
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!form.name?.trim() || isGenerating}
                className="group mb-0.5 flex items-center gap-1.5 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 shadow-sm transition-all hover:border-violet-300 hover:from-violet-100 hover:to-purple-100 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-violet-50 disabled:hover:to-purple-50 disabled:active:scale-100"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : "transition-transform group-hover:scale-110"}`} />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>
            <div className="relative">
              <textarea
                value={form.description}
                onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
                placeholder="Describe the venue — layout, ambiance, amenities, parking..."
                rows={3}
                disabled={isGenerating}
                className={`w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed ${isGenerating ? "animate-pulse border-violet-200 bg-violet-50/30" : "border-slate-200"}`}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm ring-1 ring-violet-100">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
                    <span className="ml-1 text-xs font-medium text-violet-600">Writing your description...</span>
                  </div>
                </div>
              )}
            </div>
            {generateError && <p className="mt-1 text-xs text-red-500">{generateError}</p>}
          </div>

          <SectionDivider title="Venue Images" />

          <div className="md:col-span-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200 ${isDragActive ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <CloudUpload className={`mx-auto mb-2 h-8 w-8 transition-colors ${isDragActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"}`} />
              <p className={`text-sm font-medium transition-colors ${isDragActive ? "text-primary" : "text-slate-600"}`}>
                {isDragActive ? "Drop your images here" : "Drag & drop images here"}
              </p>
              <p className="mt-1 text-xs text-slate-400">or</p>
              <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-primary/40 hover:text-primary active:scale-95">
                Browse files
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={onImageUpload}
                  disabled={isUploadingImages || isSubmitting}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 text-[11px] text-slate-400">JPG, PNG or WEBP — max 10 files</p>
            </div>

            {isUploadingImages ? <p className="mt-2 text-xs text-primary">Uploading images...</p> : null}

            {form.imageUrls?.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {form.imageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <img src={url} alt={`Venue upload ${index + 1}`} loading="lazy" decoding="async" className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
            >
              {isSubmitting ? "Saving..." : isUploadingImages ? "Uploading images..." : editingId ? "Update Venue" : "Create Venue"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploadingImages}
              className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
