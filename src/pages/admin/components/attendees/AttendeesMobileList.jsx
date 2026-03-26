import { AttendeeCard } from "@/pages/admin/components/attendees/AttendeeCard";

export function AttendeesMobileList({ attendees, isAdmin, onCancel, cancellingBookingId }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {attendees.length === 0 ? (
        <div className="surface-card p-6 text-center text-sm text-slate-600">No attendees found.</div>
      ) : (
        attendees.map((attendee) => (
          <AttendeeCard
            key={attendee.id}
            attendee={attendee}
            isAdmin={isAdmin}
            onCancel={onCancel}
            isCancelling={cancellingBookingId === attendee.id}
          />
        ))
      )}
    </div>
  );
}
