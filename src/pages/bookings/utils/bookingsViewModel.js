const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function formatDateTime(value) {
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

export function toBookingViewModel(booking, event, venue) {
  const status = (booking.status || "").toUpperCase();
  const ticketPrice = Number(event?.ticketPrice ?? 0);
  const seatCount = Number(booking.seatCount ?? 0);
  const total = ticketPrice * seatCount;
  const startTime = event?.startTime ? new Date(event.startTime) : null;
  const isMissingEvent = !event;
  const isConcluded =
    !isMissingEvent
    && status !== "CANCELLED"
    && startTime
    && !Number.isNaN(startTime.getTime())
    && startTime.getTime() < Date.now();

  const displayStatus = status === "CANCELLED"
    ? "CANCELLED"
    : isConcluded || isMissingEvent
      ? "CONCLUDED"
      : status;

  return {
    id: booking.id,
    bookingId: booking.id,
    status: displayStatus,
    title: event?.title || "Event concluded",
    date: event?.startTime ? formatDateTime(event.startTime) : "This event is no longer available for booking",
    bookedAt: formatDateTime(booking.bookedAt),
    location: venue?.address || "Venue details unavailable",
    seats: `${seatCount} seat${seatCount === 1 ? "" : "s"}`,
    price: currencyFormatter.format(total),
    imageUrls: (
      Array.isArray(event?.imageUrls) && event.imageUrls.length
        ? event.imageUrls
        : Array.isArray(venue?.imageUrls)
          ? venue.imageUrls
          : []
    ),
    startTime: isMissingEvent ? new Date(0) : startTime,
  };
}
