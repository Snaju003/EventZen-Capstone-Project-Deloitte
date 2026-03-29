import { useEffect, useMemo, useRef, useState } from "react";
import { CloudUpload, DollarSign, FileText, ImageIcon, Info, Sparkles, Tag, Wallet, X } from "lucide-react";

import { generateEventDescription } from "@/lib/events-api";

import { EventDateTimePicker } from "@/pages/admin/components/event-form/EventDateTimePicker";
import { EventFieldLabel } from "@/pages/admin/components/event-form/EventFieldLabel";
import { EventTicketTypesEditor } from "@/pages/admin/components/event-form/EventTicketTypesEditor";
import { EventVendorDropdown } from "@/pages/admin/components/event-form/EventVendorDropdown";
import { EventVenueDropdown } from "@/pages/admin/components/event-form/EventVenueDropdown";

function FormSectionDivider({ title }) {
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

export function EventFormDialog({
  form,
  setForm,
  venues,
  vendors = [],
  isAdmin,
  editingId,
  submitting,
  uploadingImages,
  onSubmit,
  onClose,
  onImageDrop,
  onImageUpload,
  onRemoveImage,
  allEvents = [],
}) {
  const descriptionRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const bookedDates = useMemo(() => {
    if (!form.venueId) return [];
    return allEvents
      .filter((event) => event.venueId === form.venueId && event.id !== editingId)
      .flatMap((event) => {
        const dates = [];
        const start = event.startTime ? new Date(event.startTime) : null;
        const end = event.endTime ? new Date(event.endTime) : null;
        if (start && end) {
          const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          while (cursor <= endDay) {
            dates.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        } else if (start) {
          dates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
        }
        return dates;
      });
  }, [allEvents, form.venueId, editingId]);

  const handleGenerateDescription = async () => {
    if (!form.title?.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerateError("");

    try {
      const description = await generateEventDescription(form.title.trim());
      setForm((previous) => ({ ...previous, description }));
    } catch (error) {
      setGenerateError("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (uploadingImages || submitting) {
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

    if (uploadingImages || submitting) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files?.length) {
      return;
    }

    await onImageDrop(files);
  };

  useEffect(() => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [form.description]);

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FormSectionDivider title="Basic Information" />

      <div className="flex flex-col gap-1">
        <EventFieldLabel icon={Tag} label="Event Title" hint="A clear, descriptive name for your event" required />
        <input
          value={form.title}
          onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
          placeholder="e.g. Annual Tech Conference 2025"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <EventVenueDropdown
        venues={venues}
        value={form.venueId}
        onChange={(venueId) => setForm((previous) => ({ ...previous, venueId }))}
        required
      />

      <div className="flex flex-col gap-1 md:col-span-2">
        <div className="flex items-end justify-between gap-2">
          <EventFieldLabel icon={FileText} label="Description" hint="Provide details about what attendees can expect" />
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={!form.title?.trim() || isGenerating}
            className="group mb-0.5 flex items-center gap-1.5 rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 shadow-sm transition-all hover:border-violet-300 hover:from-violet-100 hover:to-purple-100 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-violet-50 disabled:hover:to-purple-50 disabled:active:scale-100"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : "transition-transform group-hover:scale-110"}`} />
            {isGenerating ? "Generating..." : "Generate with AI"}
          </button>
        </div>
        <div className="relative">
          <textarea
            ref={descriptionRef}
            value={form.description}
            onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
            placeholder="Describe your event — agenda, speakers, activities, dress code..."
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

      <FormSectionDivider title="Schedule" />

      <EventDateTimePicker
        label="Start Date & Time"
        hint="When does the event begin?"
        value={form.startTime}
        onChange={(nextValue) => setForm((previous) => ({ ...previous, startTime: nextValue }))}
        bookedDates={bookedDates}
        required
      />

      <EventDateTimePicker
        label="End Date & Time"
        hint="When does the event finish?"
        value={form.endTime}
        onChange={(nextValue) => setForm((previous) => ({ ...previous, endTime: nextValue }))}
        minValue={form.startTime}
        bookedDates={bookedDates}
        required
      />

      <FormSectionDivider title="Ticket Types & Pricing" />

      <div className="md:col-span-2">
        <EventTicketTypesEditor
          ticketTypes={form.ticketTypes || []}
          onChange={(ticketTypes) => setForm((previous) => ({ ...previous, ticketTypes }))}
        />
      </div>

      {!isAdmin ? (
        <div className="flex flex-col gap-1 md:col-span-2">
          <EventFieldLabel icon={Info} label="Your Agreed Vendor Cost (INR)" hint="The amount agreed with the organiser for your services" required />
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.agreedCost}
            onChange={(event) => setForm((previous) => ({ ...previous, agreedCost: event.target.value }))}
            placeholder="e.g. 25000"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </div>
      ) : null}

      {isAdmin ? (
        <>
          <FormSectionDivider title="Vendor Assignment" />

          <div className="flex flex-col gap-1">
            <EventVendorDropdown
              vendors={vendors}
              value={form.vendorId}
              onChange={(vendorId) => setForm((previous) => ({ ...previous, vendorId }))}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <EventFieldLabel icon={DollarSign} label="Agreed Vendor Cost (INR)" hint="The cost agreed with the vendor for their services" required />
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.agreedCost}
              onChange={(event) => setForm((previous) => ({ ...previous, agreedCost: event.target.value }))}
              placeholder="e.g. 25000"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <EventFieldLabel icon={Wallet} label="Total Event Budget (INR)" hint="Overall budget allocated for this event" required />
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.totalBudget}
              onChange={(event) => setForm((previous) => ({ ...previous, totalBudget: event.target.value }))}
              placeholder="e.g. 100000"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </>
      ) : null}

      <div className="md:col-span-2">
        <FormSectionDivider title="Event Images" />
        <EventFieldLabel icon={ImageIcon} label="Upload Photos" hint="Up to 10 images — JPG, PNG, or WEBP (best: 16:9 ratio)" />
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`group mt-1 cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200 ${isDragActive ? "border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"}`}
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
              disabled={uploadingImages || submitting}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[11px] text-slate-400">JPG, PNG or WEBP — max 10 files</p>
        </div>
        {uploadingImages ? <p className="mt-2 text-xs text-primary">Uploading images...</p> : null}

        {form.imageUrls?.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {form.imageUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <img src={url} alt={`Event upload ${index + 1}`} className="h-16 w-full object-cover" />
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
          disabled={submitting || uploadingImages}
          className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
        >
          {submitting ? "Saving..." : uploadingImages ? "Uploading images..." : editingId ? "Update Event" : "Create Event"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
