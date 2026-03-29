import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { motion } from "framer-motion";

import { ClampedDescription } from "@/components/common/ClampedDescription";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { formatINR } from "@/lib/currency";
import { cardEnter } from "@/lib/animations";
import { formatEventsPageDateTime } from "@/pages/events/utils/eventsPage.utils";

export function PublishedEventCard({ event, index, venue }) {
  const navigate = useNavigate();
  const eventImages = Array.isArray(event.imageUrls) && event.imageUrls.length
    ? event.imageUrls
    : venue?.imageUrls;

  return (
    <motion.article
      className="surface-card overflow-hidden p-5"
      variants={cardEnter}
      custom={index}
      whileHover={{ y: -4, boxShadow: "0 26px 60px -38px rgba(30,64,175,0.65)" }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <ImageCarousel images={eventImages} altPrefix={event.title || "Event"} className="mb-4 h-48" />

      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{event.title || "Untitled event"}</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">{event.status || "draft"}</span>
      </div>

      <div className="mb-4">
        <ClampedDescription
          text={event.description}
          className="text-sm text-slate-600"
          actionLabel="Show more"
          onAction={() => navigate(`/events/${event.id}`)}
        />
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {formatEventsPageDateTime(event.startTime)}</p>
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {venue?.name || "Venue unavailable"} - {venue?.address || ""}</p>
        <p className="flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          {Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0
            ? `From ${formatINR(Math.min(...event.ticketTypes.map((tt) => Number(tt.price || 0))))}`
            : `${formatINR(event.ticketPrice)} per ticket`
          }
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {event.registrationOpen ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Registration Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Registration Closed
          </span>
        )}
        <Link
          to={`/events/${event.id}`}
          aria-label={`View details for ${event.title || "this event"}`}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90"
        >
          View details
        </Link>
      </div>
    </motion.article>
  );
}
