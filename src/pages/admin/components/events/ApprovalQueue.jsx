import { formatDateTime } from "@/pages/admin/components/events/adminEvents.utils";

export function ApprovalQueue({ events, onPublish, onReject, venueMap }) {
  return (
    <section className="mb-8 rounded-xl border border-amber-300 bg-amber-100/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-amber-900">Approval Queue</h2>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900">
          {events.length} pending
        </span>
      </div>

      {events.length === 0 ? (
        <p className="mt-2 text-sm text-amber-800">No pending event requests right now.</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {events.slice(0, 6).map((event) => (
            <article key={`queue-${event.id}`} className="rounded-lg border border-amber-300 bg-white p-3">
              <p className="font-semibold text-slate-900">{event.title || "Untitled event"}</p>
              <p className="mt-1 text-xs text-slate-600">{venueMap.get(event.venueId)?.name || "Unknown venue"}</p>
              <p className="text-xs text-slate-600">{formatDateTime(event.startTime)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onPublish(event)}
                  aria-label={`Approve and publish ${event.title || "event"}`}
                  className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                >
                  Approve & Publish
                </button>
                <button
                  type="button"
                  onClick={() => onReject(event)}
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
  );
}
