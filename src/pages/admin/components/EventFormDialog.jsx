import { useEffect, useRef } from "react";
import { DollarSign, FileText, ImageIcon, Info, Tag, Users, X } from "lucide-react";

import { EventDateTimePicker } from "@/pages/admin/components/event-form/EventDateTimePicker";
import { EventFieldLabel } from "@/pages/admin/components/event-form/EventFieldLabel";
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
  isAdmin,
  editingId,
  submitting,
  uploadingImages,
  onSubmit,
  onClose,
  onImageUpload,
  onRemoveImage,
}) {
  const descriptionRef = useRef(null);

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
        <EventFieldLabel icon={FileText} label="Description" hint="Provide details about what attendees can expect" />
        <textarea
          ref={descriptionRef}
          value={form.description}
          onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
          placeholder="Describe your event — agenda, speakers, activities, dress code..."
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <FormSectionDivider title="Schedule" />

      <EventDateTimePicker
        label="Start Date & Time"
        hint="When does the event begin?"
        value={form.startTime}
        onChange={(nextValue) => setForm((previous) => ({ ...previous, startTime: nextValue }))}
        required
      />

      <EventDateTimePicker
        label="End Date & Time"
        hint="When does the event finish?"
        value={form.endTime}
        onChange={(nextValue) => setForm((previous) => ({ ...previous, endTime: nextValue }))}
        minValue={form.startTime}
        required
      />

      <FormSectionDivider title="Capacity & Pricing" />

      <div className="flex flex-col gap-1">
        <EventFieldLabel icon={DollarSign} label="Ticket Price (INR)" hint="Set to 0 for a free event" required />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.ticketPrice}
          onChange={(event) => setForm((previous) => ({ ...previous, ticketPrice: event.target.value }))}
          placeholder="e.g. 499"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <EventFieldLabel icon={Users} label="Maximum Attendees" hint="Total seat capacity for this event" required />
        <input
          type="number"
          min="1"
          value={form.maxAttendees}
          onChange={(event) => setForm((previous) => ({ ...previous, maxAttendees: event.target.value }))}
          placeholder="e.g. 200"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
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

      <div className="md:col-span-2">
        <FormSectionDivider title="Event Images" />
        <EventFieldLabel icon={ImageIcon} label="Upload Photos" hint="Up to 10 images — JPG, PNG, or WEBP (best: 16:9 ratio)" />
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={onImageUpload}
          disabled={uploadingImages || submitting}
          className="mt-1 block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-600 transition-colors hover:border-primary/50 hover:bg-slate-50 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
        />
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
          disabled={submitting}
          className="h-10 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-60 active:scale-95"
        >
          {submitting ? "Saving..." : editingId ? "Update Event" : "Create Event"}
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
