import { useParams } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { AttendeesDesktopTable } from "@/pages/admin/components/attendees/AttendeesDesktopTable";
import { AttendeesMobileList } from "@/pages/admin/components/attendees/AttendeesMobileList";
import { useAdminAttendeesPage } from "@/pages/admin/hooks/useAdminAttendeesPage";

export default function AdminAttendees() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const {
    attendees,
    cancellingBookingId,
    cancelBooking,
    event,
    handleExportJson,
    isExporting,
    isLoading,
  } = useAdminAttendeesPage(id);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-44 w-44 bg-sky-300/20" />
      <div className="soft-orb right-[-4rem] top-32 h-40 w-40 bg-amber-200/25" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex-1">
        <section className="hero-gradient-panel animate-rise mb-6" style={{ backgroundImage: "linear-gradient(105deg, #0f172a 0%, #1f2937 50%, #0f766e 100%)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Attendee Operations</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Track participant records, export attendee data, and handle booking status from one operational panel.</p>
        </section>

        <div className="animate-rise delay-1 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Guest List</p>
            <h1 className="section-title">Attendees</h1>
            <p className="mt-1 text-sm text-slate-600">{event?.title || "Event"}</p>
          </div>
          <button
            type="button"
            onClick={handleExportJson}
            disabled={isExporting}
            className="action-secondary h-10 self-start sm:self-auto"
          >
            {isExporting ? "Exporting..." : "Export JSON"}
          </button>
        </div>

        {isLoading ? (
          <div className="surface-card p-6 text-center text-sm text-slate-600">Loading attendees...</div>
        ) : (
          <>
            <AttendeesMobileList
              attendees={attendees}
              isAdmin={isAdmin}
              onCancel={cancelBooking}
              cancellingBookingId={cancellingBookingId}
            />
            <AttendeesDesktopTable
              attendees={attendees}
              isAdmin={isAdmin}
              onCancel={cancelBooking}
              cancellingBookingId={cancellingBookingId}
            />
          </>
        )}
      </main>
    </div>
  );
}
