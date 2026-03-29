import { Link } from "react-router-dom";
import { Users, Ticket } from "lucide-react";
import { motion } from "framer-motion";

import { fadeUp } from "@/lib/animations";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function EventBookingPanel({
  availableSeats,
  canBook,
  event,
  eventId,
  handleBook,
  isAuthenticated,
  isBooking,
  maxAttendees,
  maxTicketsPerBooking,
  nonBookReason,
  paymentBreakdown,
  seatCount,
  seatPercentage,
  setSeatCount,
  confirmedSeats,
  selectedTicketType,
  onSelectTicketType,
}) {
  const parsedSeatCount = Number(seatCount);
  const maxSelectableSeats = Math.max(Math.min(availableSeats, maxTicketsPerBooking), 1);
  const exceedsPerBookingLimit = Number.isFinite(parsedSeatCount) && parsedSeatCount > maxTicketsPerBooking;
  const exceedsAvailability = Number.isFinite(parsedSeatCount) && parsedSeatCount > availableSeats;

  const ticketTypes = Array.isArray(event?.ticketTypes) && event.ticketTypes.length > 0
    ? event.ticketTypes
    : null;

  return (
    <motion.aside
      variants={fadeUp}
      transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
      className="surface-card p-6 lg:sticky lg:top-28 lg:h-fit"
    >
      <h2 className="text-xl font-bold text-slate-900">Book seats</h2>
      <p className="mt-2 text-sm text-slate-600">Reserve your seats for this event.</p>

      <div className="mt-4 space-y-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
        <p className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-medium"><Users className="h-4 w-4" /> Capacity</span>
          <span>{maxAttendees}</span>
        </p>
        <p className="flex items-center justify-between gap-2">
          <span>Confirmed seats</span>
          <span>{confirmedSeats}</span>
        </p>
        <p className="flex items-center justify-between gap-2 text-primary">
          <span className="font-semibold">Available seats</span>
          <span className="font-semibold">{availableSeats}</span>
        </p>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${seatPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-slate-500">{seatPercentage}% booked</p>
      </div>

      <form noValidate onSubmit={handleBook} className="mt-5 space-y-4">
        {/* Ticket Type Selector */}
        {ticketTypes ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Select ticket type</label>
            <div className="flex flex-col gap-2">
              {ticketTypes.map((tt) => {
                const isSelected = selectedTicketType?.id === tt.id;
                return (
                  <button
                    key={tt.id}
                    type="button"
                    onClick={() => onSelectTicketType(tt)}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-slate-200 bg-white hover:border-primary/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Ticket className={`h-4 w-4 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                      <div>
                        <p className={`font-semibold ${isSelected ? "text-primary" : "text-slate-800"}`}>{tt.name}</p>
                        {tt.description ? (
                          <p className="text-[11px] text-slate-400">{tt.description}</p>
                        ) : null}
                      </div>
                    </div>
                    <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? "text-primary" : "text-slate-700"}`}>
                      {formatCurrency(tt.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          <span className="font-medium">Seat count</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={seatCount}
            onChange={(inputEvent) => setSeatCount(inputEvent.target.value)}
            className="h-11 rounded-lg border border-slate-200 px-3 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
          />
        </label>
        <p className="text-xs text-slate-500">Choose 1-{maxSelectableSeats} seats. Maximum {maxTicketsPerBooking} tickets per booking.</p>
        {exceedsPerBookingLimit ? (
          <p className="text-xs text-red-700">You can book up to {maxTicketsPerBooking} tickets in one transaction.</p>
        ) : null}
        {exceedsAvailability ? (
          <p className="text-xs text-red-700">Only {availableSeats} seats are available right now.</p>
        ) : null}

        {paymentBreakdown && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">Payment Summary</p>
            <div className="space-y-1.5 text-sm text-slate-700">
              {selectedTicketType ? (
                <p className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>Ticket: {selectedTicketType.name}</span>
                </p>
              ) : null}
              <p className="flex items-center justify-between gap-2">
                <span>Ticket Price ({paymentBreakdown.seatCount} x {formatCurrency(paymentBreakdown.ticketPrice)})</span>
                <span>{formatCurrency(paymentBreakdown.baseAmount)}</span>
              </p>
              {paymentBreakdown.convenienceFee > 0 && (
                <p className="flex items-center justify-between gap-2 text-slate-600">
                  <span>Convenience Fee ({paymentBreakdown.convenienceFeePercent}%)</span>
                  <span>{formatCurrency(paymentBreakdown.convenienceFee)}</span>
                </p>
              )}
              <div className="my-1.5 border-t border-emerald-200" />
              <p className="flex items-center justify-between gap-2 font-bold text-emerald-800">
                <span>Total Amount</span>
                <span>{formatCurrency(paymentBreakdown.totalAmount)}</span>
              </p>
            </div>
          </div>
        )}

        {isAuthenticated ? (
          <motion.button
            type="submit"
            disabled={!canBook || isBooking}
            className="h-11 w-full rounded-lg bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
            whileTap={{ scale: 0.98 }}
          >
            {isBooking ? "Processing payment..." : "Confirm seats & pay"}
          </motion.button>
        ) : (
          <Link
            to="/auth"
            state={{ activeTab: "login", from: `/events/${eventId}` }}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Log in to book and pay
          </Link>
        )}

        {!canBook ? (
          <p className="text-xs text-red-800">{nonBookReason(event, isAuthenticated, availableSeats)}</p>
        ) : null}
      </form>
    </motion.aside>
  );
}
