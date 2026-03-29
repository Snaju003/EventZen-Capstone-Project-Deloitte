import { Calendar, MapPin, Ticket, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { formatINR } from "@/lib/currency";
import { fadeUp } from "@/lib/animations";
import { formatEventDateTime } from "@/pages/events/utils/eventDetails.utils";

const TICKET_ICONS = {
  vip: Crown,
  "day pass": Star,
};

function getTicketIcon(name) {
  const normalized = (name || "").toLowerCase();
  for (const [key, icon] of Object.entries(TICKET_ICONS)) {
    if (normalized.includes(key)) return icon;
  }
  return Ticket;
}

export function EventOverviewPanel({ event }) {
  const ticketTypes = Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0
    ? event.ticketTypes
    : null;

  const detailItems = [
    { icon: Calendar, label: "Starts", value: formatEventDateTime(event.startTime) },
    { icon: Calendar, label: "Ends", value: formatEventDateTime(event.endTime) },
    {
      icon: MapPin,
      label: "Venue",
      value: event.venue?.name || "Venue unavailable",
      sub: event.venue?.address,
    },
  ];

  // Only show flat ticket price if no ticket types exist (backward compat)
  if (!ticketTypes) {
    detailItems.push({ icon: Ticket, label: "Ticket price", value: formatINR(event.ticketPrice) });
  }

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

      {ticketTypes ? (
        <div className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900">
            <Ticket className="h-5 w-5 text-primary" />
            Available Tickets
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ticketTypes.map((tt, index) => {
              const IconComponent = getTicketIcon(tt.name);
              return (
                <motion.div
                  key={tt.id || index}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.08, duration: 0.35 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">{tt.name}</h3>
                  </div>
                  {tt.description ? (
                    <p className="mb-3 text-xs text-slate-500">{tt.description}</p>
                  ) : null}
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-lg font-bold text-primary">{formatINR(tt.price)}</span>
                    <span className="text-[11px] text-slate-400">
                      {tt.maxQuantity ? `${tt.maxQuantity} seats` : ""}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
