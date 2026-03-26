import { ImageCarousel } from "@/components/ui/ImageCarousel";

export function VenueCard({ deletingVenueId, isSubmitting, onDelete, onEdit, venue }) {
  return (
    <article className="surface-card surface-card-hover p-5">
      <ImageCarousel images={venue.imageUrls} altPrefix={venue.name || "Venue"} className="mb-4 h-44" />
      <h3 className="text-lg font-bold text-slate-900">{venue.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{venue.address}</p>
      <p className="mt-2 text-sm text-slate-700">Capacity: {venue.capacity || 0}</p>
      <p className="mt-2 text-sm text-slate-600">{venue.description || "No description"}</p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(venue)}
          disabled={deletingVenueId === venue.id || isSubmitting}
          className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-60"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(venue.id)}
          disabled={deletingVenueId === venue.id}
          className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900 disabled:opacity-60"
        >
          {deletingVenueId === venue.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
