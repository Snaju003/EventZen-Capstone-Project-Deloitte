import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Ticket, Calendar, MapPin, Users, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getApiErrorMessage } from "@/lib/auth-api";
import { cancelMyBooking, getMyBookings } from "@/lib/bookings-api";
import { getEventById, getVenues } from "@/lib/events-api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

function formatDateTime(value) {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingCard({ booking, isCancelling, onCancel }) {
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isCancelled ? "opacity-80 bg-white/50" : ""}`}>
      <div className="flex flex-col lg:flex-row">
        <div className={`lg:w-1/3 h-48 lg:h-auto overflow-hidden ${isCancelled ? "grayscale" : ""}`}>
          <ImageCarousel images={booking.imageUrls} altPrefix={booking.title || "Booking event"} className="h-full w-full rounded-none" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isCancelled ? "bg-slate-200 text-slate-600" : "bg-green-100 text-green-700"}`}>
                  {booking.status}
                </span>
                <span className="text-slate-400 text-xs font-medium">• Booking ID: {booking.bookingId}</span>
              </div>
              <h3 className={`text-xl font-bold ${isCancelled ? "text-slate-500" : "text-slate-900"}`}>{booking.title}</h3>
              <div className={`flex flex-wrap gap-y-2 gap-x-6 mt-1 ${isCancelled ? "text-slate-400" : "text-slate-600"}`}>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 opacity-70" />
                  {booking.date}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 opacity-70" />
                  {booking.location}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4 opacity-70" />
                  {booking.seats}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className={`text-2xl font-bold ${isCancelled ? "text-slate-400 line-through" : "text-primary"}`}>{booking.price}</span>
              <span className="text-xs text-slate-400">Booked on {booking.bookedAt}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
            {!isCancelled ? (
              <button
                className="flex items-center justify-center gap-2 text-red-800 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors disabled:opacity-60"
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling}
              >
                <XCircle className="w-4 h-4" />
                {isCancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            ) : (
              <p className="text-sm text-slate-500 italic">This booking was cancelled. No further actions available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function toViewModel(booking, event, venue) {
  const status = (booking.status || "").toUpperCase();
  const ticketPrice = Number(event?.ticketPrice ?? 0);
  const seatCount = Number(booking.seatCount ?? 0);
  const total = ticketPrice * seatCount;
  const startTime = event?.startTime ? new Date(event.startTime) : null;

  return {
    id: booking.id,
    bookingId: booking.id,
    status,
    title: event?.title || `Event ${booking.eventId}`,
    date: formatDateTime(event?.startTime),
    bookedAt: formatDateTime(booking.bookedAt),
    location: venue?.address || "Venue details unavailable",
    seats: `${seatCount} seat${seatCount === 1 ? "" : "s"}`,
    price: currencyFormatter.format(total),
    imageUrls:
      (Array.isArray(event?.imageUrls) && event.imageUrls.length
        ? event.imageUrls
        : Array.isArray(venue?.imageUrls)
          ? venue.imageUrls
          : []),
    startTime,
  };
}

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [rawBookings, venues] = await Promise.all([getMyBookings(), getVenues()]);
      const venueMap = new Map(venues.map((venue) => [venue.id, venue]));
      const eventIds = [...new Set(rawBookings.map((booking) => booking.eventId).filter(Boolean))];

      const eventResults = await Promise.allSettled(
        eventIds.map((eventId) => getEventById(eventId)),
      );

      const eventMap = new Map();
      eventResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.id) {
          eventMap.set(eventIds[index], result.value);
        }
      });

      const mapped = rawBookings.map((booking) => {
        const event = eventMap.get(booking.eventId) || null;
        const venue = event?.venueId ? venueMap.get(event.venueId) : null;
        return toViewModel(booking, event, venue);
      });

      setBookings(mapped);
    } catch (error) {
      setLoadError(
        getApiErrorMessage(error, "Could not load your bookings right now."),
      );
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const upcomingBookings = useMemo(() => {
    const now = Date.now();

    return bookings.filter((booking) => {
      if (booking.status === "CANCELLED") return false;
      if (!booking.startTime) return true;
      return booking.startTime.getTime() >= now;
    });
  }, [bookings]);

  const pastBookings = useMemo(() => {
    const now = Date.now();

    return bookings.filter((booking) => {
      if (booking.status === "CANCELLED") return true;
      if (!booking.startTime) return false;
      return booking.startTime.getTime() < now;
    });
  }, [bookings]);

  const visibleBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);

    try {
      await cancelMyBooking(bookingId);
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking,
        ),
      );
      toast.success("Booking cancelled successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel this booking."));
    } finally {
      setCancellingId("");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-500 mt-1">Manage your event reservations and history</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === "upcoming" ? "font-bold bg-white shadow-sm text-primary" : "font-medium text-slate-600 hover:text-slate-900"}`}
              onClick={() => setActiveTab("upcoming")}
              type="button"
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === "past" ? "font-bold bg-white shadow-sm text-primary" : "font-medium text-slate-600 hover:text-slate-900"}`}
              onClick={() => setActiveTab("past")}
              type="button"
            >
              Past Events
            </button>
          </div>
        </div>

        {loadError ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadBookings}
              className="mt-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading your bookings...
          </div>
        ) : visibleBookings.length > 0 ? (
          <div className="grid gap-6">
            {visibleBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isCancelling={cancellingId === booking.id}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            No {activeTab} bookings found.
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary opacity-60">
            <div className="size-5 bg-primary rounded-sm flex items-center justify-center text-white">
              <Ticket className="w-3 h-3" />
            </div>
            <span className="font-bold text-sm tracking-tight">EventZen Portal</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 EventZen Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
