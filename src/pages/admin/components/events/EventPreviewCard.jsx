import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { formatINR } from "@/lib/currency";

export function EventPreviewCard({
  editingId,
  previewDescription,
  previewImages,
  previewStartTime,
  previewTitle,
  previewVenue,
  ticketPrice,
}) {
  return (
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
          <p>{formatINR(Number(ticketPrice || 0))} per ticket</p>
        </div>
      </article>
    </section>
  );
}
