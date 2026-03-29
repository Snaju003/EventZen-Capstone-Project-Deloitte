import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getApiErrorMessage, getUsersByIds } from "@/lib/auth-api";
import { adminCancelBooking, getEventAttendees } from "@/lib/bookings-api";
import { getEventById } from "@/lib/events-api";
import {
  buildUsersById,
  downloadJson,
  enrichAttendees,
} from "@/pages/admin/components/attendees/attendees.utils";

export function useAdminAttendeesPage(id) {
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState("");

  const loadData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [eventResult, attendeesData] = await Promise.all([
        getEventById(id).then((data) => ({ data, notFound: false })).catch((error) => {
          if (Number(error?.response?.status) === 404) {
            return { data: null, notFound: true };
          }

          throw error;
        }),
        getEventAttendees(id),
      ]);

      const uniqueUserIds = [...new Set(
        attendeesData
          .map((attendee) => attendee.userId)
          .filter((userId) => typeof userId === "string" && userId.trim()),
      )];

      let usersById = new Map();
      if (uniqueUserIds.length) {
        const users = await getUsersByIds(uniqueUserIds);
        usersById = buildUsersById(users);
      }

      setEvent(eventResult.data);
      setAttendees(enrichAttendees(attendeesData, usersById));

      if (eventResult.notFound) {
        toast("Event details unavailable, but attendee data is loaded.", { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load attendees."));
      setEvent(null);
      setAttendees([]);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cancelBooking = async (bookingId) => {
    if (cancellingBookingId === bookingId) {
      return;
    }

    setCancellingBookingId(bookingId);
    try {
      await adminCancelBooking(bookingId);
      toast.success("Booking cancelled.");
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel booking."));
    } finally {
      setCancellingBookingId("");
    }
  };

  const handleExportJson = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      downloadJson(`event-${id}-attendees.json`, attendees);
      toast.success("Attendees exported.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to export attendees."));
    } finally {
      setIsExporting(false);
    }
  };

  return {
    attendees,
    cancellingBookingId,
    cancelBooking,
    event,
    handleExportJson,
    isExporting,
    isLoading,
  };
}
