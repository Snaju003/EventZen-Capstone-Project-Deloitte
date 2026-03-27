import { Calendar, MapPin, Ticket, Users, XCircle } from "lucide-react";
import { motion } from "framer-motion";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cardEnter } from "@/lib/animations";

export function BookingCard({ booking, isCancelling, onCancel, onViewTicket, index = 0 }) {
  const isCancelled = booking.status === "CANCELLED";
  const isConcluded = booking.status === "CONCLUDED";

  return (
    <motion.div
      variants={cardEnter}
      custom={index}
      whileHover={!isCancelled ? { y: -3, boxShadow: "0 26px 60px -38px rgba(31,42,54,0.65)" } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm ${isCancelled ? "opacity-80 bg-white/60" : ""}`}
    >
      <div className="flex flex-col lg:flex-row">
        <div className={`lg:w-1/3 h-48 lg:h-auto overflow-hidden ${isCancelled ? "grayscale" : ""}`}>
          <ImageCarousel images={booking.imageUrls} altPrefix={booking.title || "Booking event"} className="h-full w-full rounded-none" />
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isCancelled ? "bg-slate-200 text-slate-600" : isConcluded ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {booking.status}
                </span>
                <span className="text-slate-400 text-xs font-medium">• Booking ID: {booking.bookingId}</span>
              </div>

              <h3 className={`text-xl font-bold ${isCancelled ? "text-slate-500" : "text-slate-900"}`}>{booking.title}</h3>
              <div className={`flex flex-wrap gap-y-2 gap-x-6 mt-1 ${isCancelled ? "text-slate-400" : "text-slate-600"}`}>
                <div className="flex items-center gap-1.5 text-sm"><Calendar className="w-4 h-4 opacity-70" />{booking.date}</div>
                <div className="flex items-center gap-1.5 text-sm"><MapPin className="w-4 h-4 opacity-70" />{booking.location}</div>
                <div className="flex items-center gap-1.5 text-sm"><Users className="w-4 h-4 opacity-70" />{booking.seats}</div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className={`text-2xl font-bold ${isCancelled ? "text-slate-400 line-through" : "text-primary"}`}>{booking.price}</span>
              <span className="text-xs text-slate-400">Booked on {booking.bookedAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
            {!isCancelled && !isConcluded ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                  onClick={() => onViewTicket(booking)}
                >
                  <Ticket className="h-4 w-4" />
                  View Ticket
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-60"
                      disabled={isCancelling}
                    >
                      <XCircle className="w-4 h-4" />
                      {isCancelling ? "Cancelling..." : "Cancel Booking"}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel your booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your booking for "{booking.title}"? This will free up your seats.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onCancel(booking.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                {isCancelled
                  ? "This booking was cancelled. No further actions available."
                  : "This event has concluded. Ticket actions are no longer available."}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
