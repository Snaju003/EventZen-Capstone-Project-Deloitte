import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";
import toast from "react-hot-toast";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getApiErrorMessage } from "@/lib/auth-api";
import { createBooking, getEventBookingCount } from "@/lib/bookings-api";
import { formatINR } from "@/lib/currency";
import { getEventById, getVenues } from "@/lib/events-api";

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

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [confirmedSeats, setConfirmedSeats] = useState(0);
  const [seatCount, setSeatCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const loadEvent = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError("");

    try {
      const [eventResponse, venues] = await Promise.all([
        getEventById(id),
        getVenues(),
      ]);

      const venueFromEvent = eventResponse?.venue;
      const venueFromLookup = venues.find((venue) => venue.id === eventResponse?.venueId);

      setEvent({
        ...eventResponse,
        venue: venueFromEvent || venueFromLookup || null,
      });

      try {
        const seatResponse = await getEventBookingCount(id);
        setConfirmedSeats(Number(seatResponse?.confirmedSeats || 0));
      } catch {
        setConfirmedSeats(0);
      }
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Failed to load event details."));
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const maxAttendees = Number(event?.maxAttendees || 0);
  const availableSeats = Math.max(maxAttendees - confirmedSeats, 0);

  const canBook = useMemo(() => {
    return event?.status === "published" && availableSeats > 0;
  }, [availableSeats, event?.status]);

  const handleBook = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!id) return;

    const parsedSeats = Number(seatCount);
    if (!Number.isFinite(parsedSeats) || parsedSeats < 1) {
      toast.error("Please enter a valid seat count.");
      return;
    }

    if (parsedSeats > availableSeats) {
      toast.error(`Only ${availableSeats} seats are currently available.`);
      return;
    }

    setIsBooking(true);
    try {
      await createBooking({ eventId: id, seatCount: parsedSeats });
      toast.success("Booking confirmed.");
      navigate("/my-bookings");
    } catch (bookingError) {
      toast.error(getApiErrorMessage(bookingError, "Unable to complete booking."));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <div className="mb-4">
          <Link to="/events" className="text-sm font-semibold text-primary hover:underline">
            Back to events
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{error}</p>
            <button type="button" onClick={loadEvent} className="mt-2 font-semibold underline">
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading event details...
          </div>
        ) : event ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <ImageCarousel
                images={Array.isArray(event.imageUrls) && event.imageUrls.length ? event.imageUrls : event.venue?.imageUrls}
                altPrefix={event.title || "Event"}
                className="mb-5 h-64"
              />
              <h1 className="text-3xl font-bold text-slate-900">{event.title || "Untitled event"}</h1>
              <p className="mt-3 text-slate-600">{event.description || "No event description available."}</p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4" />
                    Starts
                  </p>
                  <p>{formatDateTime(event.startTime)}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4" />
                    Ends
                  </p>
                  <p>{formatDateTime(event.endTime)}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4" />
                    Venue
                  </p>
                  <p>{event.venue?.name || "Venue unavailable"}</p>
                  <p className="mt-1 text-xs text-slate-500">{event.venue?.address || ""}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  <p className="mb-1 flex items-center gap-2 font-medium">
                    <Ticket className="h-4 w-4" />
                    Ticket price
                  </p>
                  <p>{formatINR(event.ticketPrice)}</p>
                </div>
              </div>
            </section>

            <aside className="rounded-xl border border-slate-200 bg-white p-6">
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
              </div>

              <form onSubmit={handleBook} className="mt-5 space-y-3">
                <label className="flex flex-col gap-1 text-sm text-slate-700">
                  <span className="font-medium">Seat count</span>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(availableSeats, 1)}
                    value={seatCount}
                    onChange={(inputEvent) => setSeatCount(inputEvent.target.value)}
                    className="h-11 rounded-lg border border-slate-200 px-3 outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
                  />
                </label>

                <button
                  type="submit"
                  disabled={!canBook || isBooking}
                  className="h-11 w-full rounded-lg bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isBooking ? "Booking..." : "Confirm booking"}
                </button>

                {!canBook ? (
                  <p className="text-xs text-red-800">
                    {event?.status !== "published"
                      ? "This event is not open for booking."
                      : "No seats left for this event."}
                  </p>
                ) : null}
              </form>
            </aside>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Event not found.
          </div>
        )}
      </main>
    </div>
  );
}
