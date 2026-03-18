import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage, getUsersByIds } from "@/lib/auth-api";
import { adminCancelBooking, getEventAttendees } from "@/lib/bookings-api";
import { getEventById } from "@/lib/events-api";

function downloadJson(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Pill badge for booking status */
function StatusBadge({ status }) {
  const colours = {
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-900 border-red-300",
    pending: "bg-amber-100 text-amber-900 border-amber-300",
  };
  const cls = colours[status?.toLowerCase()] ?? "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

/** Cancel button shared between table and card views */
function CancelButton({ status, onClick }) {
  if (status === "cancelled") {
    return <span className="text-xs text-slate-400">Cancelled</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-900 transition-colors hover:bg-red-200 active:scale-95"
    >
      Cancel
    </button>
  );
}

/**
 * Mobile card — shown on screens < md.
 * Displays all attendee fields in a stacked, label-value layout.
 */
function AttendeeCard({ attendee, isAdmin, onCancel }) {
  const fields = [
    { label: "Booking ID", value: attendee.bookingId || attendee.id },
    { label: "Name", value: attendee.resolvedName },
    { label: "Email", value: attendee.resolvedEmail },
    ...(isAdmin ? [{ label: "_id", value: attendee.userId || attendee.user?._id || "—" }] : []),
    { label: "Seats", value: attendee.seatCount ?? 0 },
    { label: "Booked At", value: attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleString() : "—" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Status + action row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <StatusBadge status={attendee.status} />
        <CancelButton status={attendee.status} onClick={() => onCancel(attendee.id)} />
      </div>

      {/* Field grid */}
      <dl className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-4">
        {fields.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
            <dd className="mt-0.5 break-all text-sm text-slate-700">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AdminAttendees() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      const [eventData, attendeesData] = await Promise.all([
        getEventById(id),
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
        usersById = new Map(users.map((u) => [u.id, u]));
      }

      const enrichedAttendees = attendeesData.map((attendee) => {
        const userById = usersById.get(attendee.userId);
        return {
          ...attendee,
          resolvedName:
            attendee.userName || attendee.name || attendee.user?.name || userById?.name || "Unknown",
          resolvedEmail:
            attendee.userEmail || attendee.email || attendee.user?.email || userById?.email || "Unknown",
        };
      });

      setEvent(eventData);
      setAttendees(enrichedAttendees);
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
    try {
      await adminCancelBooking(bookingId);
      toast.success("Booking cancelled.");
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to cancel booking."));
    }
  };

  const colSpan = isAdmin ? 8 : 7;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Attendees</h1>
            <p className="mt-1 text-sm text-slate-500">{event?.title || "Event"}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadJson(`event-${id}-attendees.json`, attendees)}
            className="h-10 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
          >
            Export JSON
          </button>
        </div>

        {/* ── Loading ─────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Loading attendees…
          </div>
        ) : (
          <>
            {/* ── Mobile card list (hidden on md+) ───────────────── */}
            <div className="flex flex-col gap-3 md:hidden">
              {attendees.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No attendees found.
                </div>
              ) : (
                attendees.map((attendee) => (
                  <AttendeeCard
                    key={attendee.id}
                    attendee={attendee}
                    isAdmin={isAdmin}
                    onCancel={cancelBooking}
                  />
                ))
              )}
            </div>

            {/* ── Desktop table (hidden below md) ───────────────── */}
            <div className="hidden md:block rounded-xl border border-slate-200 bg-white">
              <Table className="table-fixed">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Booking ID</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Name</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Email</TableHead>
                    {isAdmin && (
                      <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">User_ID</TableHead>
                    )}
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Seats</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Status</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Booked At</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id} className="border-slate-100">
                      <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">
                        {attendee.bookingId || attendee.id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">
                        {attendee.resolvedName}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">
                        {attendee.resolvedEmail}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">
                          {attendee.userId || attendee.user?._id || "—"}
                        </TableCell>
                      )}
                      <TableCell className="px-4 py-3 text-slate-700">
                        {attendee.seatCount ?? 0}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={attendee.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">
                        {attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <CancelButton
                          status={attendee.status}
                          onClick={() => cancelBooking(attendee.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {attendees.length === 0 && (
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableCell
                        colSpan={colSpan}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No attendees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
