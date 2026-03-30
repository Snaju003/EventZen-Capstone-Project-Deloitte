import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { createBooking, getEventBookingCount } from "@/lib/bookings-api";
import { getEventById, getVenues } from "@/lib/events-api";

const CONVENIENCE_FEE_PERCENT = 5;
const MAX_TICKETS_PER_BOOKING = 10;

export function getCannotBookMessage(event, isAuthenticated, availableSeats) {
  if (!isAuthenticated) {
    return "Please log in before booking.";
  }

  if (event?.status !== "published") {
    return "This event is not open for booking.";
  }

  if (!event?.registrationOpen) {
    return "Registration is currently closed for this event.";
  }

  if (availableSeats <= 0) {
    return "No seats left for this event.";
  }

  return "Only customer accounts can book seats.";
}

export function useEventDetailsPage(id, navigate) {
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [confirmedSeats, setConfirmedSeats] = useState(0);
  const [seatCount, setSeatCount] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const loadEvent = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError("");

    try {
      const [eventResponse, venues] = await Promise.all([getEventById(id), getVenues()]);

      const venueFromEvent = eventResponse?.venue;
      const venueFromLookup = venues.find((venue) => venue.id === eventResponse?.venueId);

      const loadedEvent = {
        ...eventResponse,
        venue: venueFromEvent || venueFromLookup || null,
      };

      setEvent(loadedEvent);

      // Auto-select first ticket type if available
      const ticketTypes = Array.isArray(loadedEvent.ticketTypes) ? loadedEvent.ticketTypes : [];
      if (ticketTypes.length > 0) {
        setSelectedTicketType(ticketTypes[0]);
      }

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
  const seatPercentage = maxAttendees > 0 ? Math.round((confirmedSeats / maxAttendees) * 100) : 0;

  const canBook = useMemo(
    () => isAuthenticated && event?.status === "published" && Boolean(event?.registrationOpen) && availableSeats > 0 && user?.role === "customer",
    [availableSeats, event?.status, event?.registrationOpen, isAuthenticated, user?.role],
  );

  // Resolve ticket price from selected ticket type or fallback to event.ticketPrice
  const resolvedTicketPrice = useMemo(() => {
    if (selectedTicketType?.price != null) {
      return Number(selectedTicketType.price);
    }
    return Number(event?.ticketPrice || 0);
  }, [selectedTicketType, event?.ticketPrice]);

  const paymentBreakdown = useMemo(() => {
    const ticketPrice = resolvedTicketPrice;
    const parsedSeats = Number(seatCount) || 0;

    if (!ticketPrice || parsedSeats < 1) {
      return null;
    }

    const baseAmount = ticketPrice * parsedSeats;
    const convenienceFee = baseAmount * (CONVENIENCE_FEE_PERCENT / 100);
    const totalAmount = baseAmount + convenienceFee;

    return {
      ticketPrice,
      baseAmount,
      convenienceFee,
      convenienceFeePercent: CONVENIENCE_FEE_PERCENT,
      totalAmount,
      seatCount: parsedSeats,
    };
  }, [resolvedTicketPrice, seatCount]);

  const handleBook = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!id) return;

    const parsedSeats = Number(seatCount);
    if (!Number.isFinite(parsedSeats) || parsedSeats < 1) {
      toast.error("Please enter a valid seat count.");
      return;
    }

    if (parsedSeats > MAX_TICKETS_PER_BOOKING) {
      toast.error(`You can book up to ${MAX_TICKETS_PER_BOOKING} tickets per transaction.`);
      return;
    }

    if (parsedSeats > availableSeats) {
      toast.error(`Only ${availableSeats} seats are currently available.`);
      return;
    }

    // Require ticket type selection if event has ticket types
    const hasTicketTypes = Array.isArray(event?.ticketTypes) && event.ticketTypes.length > 0;
    if (hasTicketTypes && !selectedTicketType) {
      toast.error("Please select a ticket type.");
      return;
    }

    setIsBooking(true);
    try {
      await createBooking({
        eventId: id,
        seatCount: parsedSeats,
        ticketTypeId: selectedTicketType?.id || undefined,
        ticketTypeName: selectedTicketType?.name || undefined,
      });
      toast.success("Ticket booked successfully.");
      navigate("/my-bookings");
    } catch (bookingError) {
      toast.error(getApiErrorMessage(bookingError, "Unable to complete booking."));
    } finally {
      setIsBooking(false);
    }
  };

  return {
    availableSeats,
    canBook,
    confirmedSeats,
    error,
    event,
    handleBook,
    id,
    isAuthenticated,
    isBooking,
    isLoading,
    loadEvent,
    maxAttendees,
    paymentBreakdown,
    seatCount,
    seatPercentage,
    selectedTicketType,
    setSelectedTicketType,
    setSeatCount,
    user,
    maxTicketsPerBooking: MAX_TICKETS_PER_BOOKING,
  };
}
