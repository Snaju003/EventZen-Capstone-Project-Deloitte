import { Calendar, MapPin, Ticket } from "lucide-react";
import { motion } from "framer-motion";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { formatINR } from "@/lib/currency";
import { fadeUp } from "@/lib/animations";
import { formatEventDateTime } from "@/pages/events/utils/eventDetails.utils";

export function EventOverviewPanel({ event }) {
  const detailItems = [
    { icon: Calendar, label: "Starts", value: formatEventDateTime(event.startTime) },
    { icon: Calendar, label: "Ends", value: formatEventDateTime(event.endTime) },
    {
      icon: MapPin,
      label: "Venue",
      value: event.venue?.name || "Venue unavailable",
      sub: event.venue?.address,
    },
    { icon: Ticket, label: "Ticket price", value: formatINR(event.ticketPrice) },
  ];

  return (
    <motion.section
      variants={fadeUp}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="surface-card p-6 lg:col-span-2"
    >
      <ImageCarousel
        images={Array.isArray(event.imageUrls) && event.imageUrls.length ? event.imageUrls : event.venue?.imageUrls}
        altPrefix={event.title || "Event"}
        className="mb-5 h-64"
      />
      <h1 className="text-3xl font-bold text-slate-900">{event.title || "Untitled event"}</h1>
      <p className="mt-3 text-slate-600">{event.description || "No event description available."}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {detailItems.map((item, index) => (
          <motion.div
            key={`${item.label}-${index}`}
            className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.35 }}
          >
            <p className="mb-1 flex items-center gap-2 font-medium">
              <item.icon className="h-4 w-4" />
              {item.label}
            </p>
            <p>{item.value}</p>
            {item.sub ? <p className="mt-1 text-xs text-slate-500">{item.sub}</p> : null}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
