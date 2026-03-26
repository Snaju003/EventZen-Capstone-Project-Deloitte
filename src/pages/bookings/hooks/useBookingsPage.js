import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import QRCode from "qrcode";

import { getApiErrorMessage } from "@/lib/auth-api";
import { cancelMyBooking, getMyBookings } from "@/lib/bookings-api";
import { getEventById, getVenues } from "@/lib/events-api";
import { toBookingViewModel } from "@/pages/bookings/utils/bookingsViewModel";
import { buildTicketCanvas } from "@/pages/bookings/utils/ticketCanvas";

function mapEventResults(eventIds, eventResults) {
  const eventMap = new Map();
  eventResults.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value?.id) {
      eventMap.set(eventIds[index], result.value);
    }
  });
  return eventMap;
}

export function useBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQrCodeUrl, setTicketQrCodeUrl] = useState("");
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [isDownloadingTicket, setIsDownloadingTicket] = useState(false);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [rawBookings, venues] = await Promise.all([getMyBookings(), getVenues()]);
      const venueMap = new Map(venues.map((venue) => [venue.id, venue]));
      const eventIds = [...new Set(rawBookings.map((booking) => booking.eventId).filter(Boolean))];

      const eventResults = await Promise.allSettled(eventIds.map((eventId) => getEventById(eventId)));
      const eventMap = mapEventResults(eventIds, eventResults);

      const mapped = rawBookings.map((booking) => {
        const event = eventMap.get(booking.eventId) || null;
        const venue = event?.venueId ? venueMap.get(event.venueId) : null;
        return toBookingViewModel(booking, event, venue);
      });

      setBookings(mapped);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Could not load your bookings right now."));
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
      if (!booking.startTime) return false;
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

  const handleCancel = useCallback(async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await cancelMyBooking(bookingId);
      setBookings((previous) => previous.map((booking) => (
        booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking
      )));
      toast.success("Booking cancelled successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel this booking."));
    } finally {
      setCancellingId("");
    }
  }, []);

  const handleViewTicket = useCallback((booking) => {
    setSelectedTicket(booking);
  }, []);

  const handleDownloadTicketPng = useCallback(async () => {
    if (!selectedTicket || !ticketQrCodeUrl) return;

    setIsDownloadingTicket(true);
    try {
      const safeBookingId = String(selectedTicket.bookingId || "ticket").replace(/[^a-zA-Z0-9_-]/g, "");
      const canvas = await buildTicketCanvas(selectedTicket, ticketQrCodeUrl);

      const downloadLink = document.createElement("a");
      downloadLink.href = canvas.toDataURL("image/png");
      downloadLink.download = `eventzen-ticket-${safeBookingId || "booking"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to download ticket as PNG."));
    } finally {
      setIsDownloadingTicket(false);
    }
  }, [selectedTicket, ticketQrCodeUrl]);

  const handleDownloadTicketPdf = useCallback(async () => {
    if (!selectedTicket || !ticketQrCodeUrl) return;

    setIsDownloadingTicket(true);
    try {
      const safeBookingId = String(selectedTicket.bookingId || "ticket").replace(/[^a-zA-Z0-9_-]/g, "");
      const canvas = await buildTicketCanvas(selectedTicket, ticketQrCodeUrl);
      const imageData = canvas.toDataURL("image/png");
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasAspect = canvas.width / canvas.height;

      let renderWidth = pageWidth - 48;
      let renderHeight = renderWidth / canvasAspect;

      if (renderHeight > pageHeight - 48) {
        renderHeight = pageHeight - 48;
        renderWidth = renderHeight * canvasAspect;
      }

      const xOffset = (pageWidth - renderWidth) / 2;
      const yOffset = (pageHeight - renderHeight) / 2;
      pdf.addImage(imageData, "PNG", xOffset, yOffset, renderWidth, renderHeight);
      pdf.save(`eventzen-ticket-${safeBookingId || "booking"}.pdf`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to download ticket as PDF."));
    } finally {
      setIsDownloadingTicket(false);
    }
  }, [selectedTicket, ticketQrCodeUrl]);

  useEffect(() => {
    if (!selectedTicket) {
      setTicketQrCodeUrl("");
      setIsGeneratingQr(false);
      return;
    }

    let active = true;
    setIsGeneratingQr(true);

    const payload = {
      bookingId: selectedTicket.bookingId,
      status: selectedTicket.status,
      eventTitle: selectedTicket.title,
      eventDate: selectedTicket.date,
      seats: selectedTicket.seats,
      location: selectedTicket.location,
      bookedAt: selectedTicket.bookedAt,
    };

    QRCode.toDataURL(JSON.stringify(payload), {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then((dataUrl) => {
        if (!active) return;
        setTicketQrCodeUrl(dataUrl);
      })
      .catch(() => {
        if (!active) return;
        setTicketQrCodeUrl("");
        toast.error("Unable to generate ticket QR code.");
      })
      .finally(() => {
        if (!active) return;
        setIsGeneratingQr(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTicket]);

  return {
    activeTab,
    bookings,
    cancellingId,
    handleCancel,
    handleDownloadTicketPdf,
    handleDownloadTicketPng,
    handleViewTicket,
    isDownloadingTicket,
    isGeneratingQr,
    isLoading,
    loadBookings,
    loadError,
    pastBookings,
    selectedTicket,
    setActiveTab,
    setSelectedTicket,
    ticketQrCodeUrl,
    upcomingBookings,
    visibleBookings,
  };
}
