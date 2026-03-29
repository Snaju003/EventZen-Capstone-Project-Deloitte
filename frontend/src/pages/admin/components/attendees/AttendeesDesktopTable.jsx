import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendeeCancelButton } from "@/pages/admin/components/attendees/AttendeeCancelButton";
import { AttendeeStatusBadge } from "@/pages/admin/components/attendees/AttendeeStatusBadge";

export function AttendeesDesktopTable({ attendees, isAdmin, onCancel, cancellingBookingId }) {
  const colSpan = isAdmin ? 8 : 7;

  return (
    <div className="surface-card animate-fade delay-2 hidden md:block">
      <Table className="table-fixed">
        <TableHeader className="bg-slate-50">
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Booking ID</TableHead>
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Name</TableHead>
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Email</TableHead>
            {isAdmin ? <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">User_ID</TableHead> : null}
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Seats</TableHead>
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Status</TableHead>
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Booked At</TableHead>
            <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-slate-500 whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendees.map((attendee) => (
            <TableRow key={attendee.id} className="border-slate-100">
              <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">{attendee.bookingId || attendee.id}</TableCell>
              <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">{attendee.resolvedName}</TableCell>
              <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">{attendee.resolvedEmail}</TableCell>
              {isAdmin ? <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">{attendee.userId || attendee.user?._id || "-"}</TableCell> : null}
              <TableCell className="px-4 py-3 text-slate-700">{attendee.seatCount ?? 0}</TableCell>
              <TableCell className="px-4 py-3"><AttendeeStatusBadge status={attendee.status} /></TableCell>
              <TableCell className="px-4 py-3 text-slate-700 break-words whitespace-normal">{attendee.bookedAt ? new Date(attendee.bookedAt).toLocaleString() : "-"}</TableCell>
              <TableCell className="px-4 py-3">
                <AttendeeCancelButton
                  status={attendee.status}
                  onClick={() => onCancel(attendee.id)}
                  isLoading={cancellingBookingId === attendee.id}
                />
              </TableCell>
            </TableRow>
          ))}

          {attendees.length === 0 ? (
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableCell colSpan={colSpan} className="px-4 py-8 text-center text-slate-500">No attendees found.</TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
