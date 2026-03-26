import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { createBooking, getEventBookingCount } from "@/lib/bookings-api";
import { getEventById, getVenues } from "@/lib/events-api";
import { createPaymentOrder, verifyPayment } from "@/lib/payments-api";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

export function getCannotBookMessage(event, isAuthenticated, availableSeats) {
  if (!isAuthenticated) {
    return "Please log in before booking and payment.";
  }

  if (event?.status !== "published") {
    return "This event is not open for booking.";
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
  const seatPercentage = maxAttendees > 0 ? Math.round((confirmedSeats / maxAttendees) * 100) : 0;

  const canBook = useMemo(
    () => isAuthenticated && event?.status === "published" && availableSeats > 0 && user?.role === "customer",
    [availableSeats, event?.status, isAuthenticated, user?.role],
  );

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
      const paymentOrder = await createPaymentOrder({ eventId: id, seatCount: parsedSeats });

      const paymentResult = await openRazorpayCheckout({
        key: paymentOrder?.keyId,
        amount: paymentOrder?.amount,
        currency: paymentOrder?.currency || "INR",
        orderId: paymentOrder?.orderId,
        name: "EventZen",
        description: `${parsedSeats} seat${parsedSeats > 1 ? "s" : ""} for ${event?.title || "event"}`,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
      });

      await verifyPayment({
        ...paymentResult,
        eventId: id,
        seatCount: parsedSeats,
      });

      await createBooking({ eventId: id, seatCount: parsedSeats });
      toast.success("Payment successful and booking confirmed.");
      navigate("/my-bookings");
    } catch (bookingError) {
      toast.error(getApiErrorMessage(bookingError, "Unable to complete payment and booking."));
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
    seatCount,
    seatPercentage,
    setSeatCount,
    user,
  };
}
