import { AttendeeCancelButton } from "@/pages/admin/components/attendees/AttendeeCancelButton";
import { AttendeeStatusBadge } from "@/pages/admin/components/attendees/AttendeeStatusBadge";

export function AttendeeCard({ attendee, isAdmin, onCancel, isCancelling }) {
  const fields = [
    { label: "Booking ID", value: attendee.bookingId || attendee.id },
    { label: "Name", value: attendee.resolvedName },
    { label: "Email", value: attendee.resolvedEmail },
    ...(isAdmin ? [{ label: "_id", value: attendee.userId || attendee.user?._id || "-" }] : []),
    { label: "Seats", value: attendee.seatCount ?? 0 },
    { label: "Booked At", value: attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleString() : "-" },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <AttendeeStatusBadge status={attendee.status} />
        <AttendeeCancelButton
          status={attendee.status}
          onClick={() => onCancel(attendee.id)}
          isLoading={isCancelling}
        />
      </div>

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
