import { useNavigate } from "react-router-dom";
import {
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  Users,
  Wallet,
  MoreVertical,
  XCircle,
  ScanLine,
} from "lucide-react";

import { ClampedDescription } from "@/components/common/ClampedDescription";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatINR } from "@/lib/currency";

function getStatusBadge(status) {
  if (status === "published") {
    return {
      label: "Published",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "border-rose-300 bg-rose-100 text-rose-900",
    };
  }

  if (status === "cancelled") {
    return {
      label: "Cancelled",
      className: "border-red-300 bg-red-100 text-red-900",
    };
  }

  return {
    label: "Pending Approval",
    className: "border-amber-300 bg-amber-100 text-amber-900",
  };
}

export function AdminEventCard({
  event,
  isAdmin,
  onCancelEvent,
  onDeleteEvent,
  onEdit,
  onOpenPublishDialog,
  onOpenRejectDialog,
  onRemoveVendor,
  onToggleRegistration,
  venueMap,
  vendorMap,
}) {
  const navigate = useNavigate();
  const normalizedStatus = (event.status || "draft").toLowerCase();
  const { label: statusBadgeLabel, className: statusBadgeClass } = getStatusBadge(normalizedStatus);
  const isRegistrationOpen = Boolean(event.registrationOpen);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-3">
      <ImageCarousel images={event.imageUrls} altPrefix={event.title || "Event"} className="mb-3 h-40" />

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 text-base font-bold leading-snug text-slate-900 line-clamp-2">{event.title || "Untitled event"}</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass}`}>
                {statusBadgeLabel}
              </span>

              {/* ── ShadCN Dropdown Menu ── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Actions for ${event.title || "event"}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit(event)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>

                  {isAdmin && normalizedStatus === "draft" ? (
                    <DropdownMenuItem onClick={() => onOpenPublishDialog(event)}>
                      <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                      Approve
                    </DropdownMenuItem>
                  ) : null}

                  {isAdmin && normalizedStatus === "draft" ? (
                    <DropdownMenuItem onClick={() => onOpenRejectDialog(event)} variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  ) : null}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Ban className="mr-2 h-4 w-4 text-amber-600" />
                        Cancel
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel this event?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will notify attendees and automatically refund any bookings. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Event</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onCancelEvent(event.id)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Cancel Event
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {isAdmin ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the event "{event.title || 'Untitled'}". 
                            All associated data will be removed from the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteEvent(event.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                          >
                            Delete Event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}

                  <DropdownMenuSeparator />

                  {isAdmin ? (
                    <DropdownMenuItem onClick={() => navigate(`/admin/events/${event.id}/attendees`)}>
                      <Users className="mr-2 h-4 w-4" />
                      Attendees
                    </DropdownMenuItem>
                  ) : null}

                  <DropdownMenuItem onClick={() => navigate(`/admin/budget/${event.id}`)}>
                    <Wallet className="mr-2 h-4 w-4" />
                    Budget
                  </DropdownMenuItem>

                  {!isAdmin && normalizedStatus === "published" ? (
                    <DropdownMenuItem onClick={() => navigate(`/vendor/check-in/${event.id}`)}>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Check-In
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-1">
            <ClampedDescription
              text={event.description || "No description"}
              className="text-sm text-slate-600"
              actionLabel="Show more"
              onAction={() => navigate(`/events/${event.id}`)}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Venue: {venueMap.get(event.venueId)?.name || "Unknown"}
          </p>
          {normalizedStatus === "rejected" ? (
            <p className="mt-1 text-xs font-medium text-rose-900">
              Rejection reason: {event.rejectionReason || "No reason provided."}
            </p>
          ) : null}
        </div>
      </div>

      {normalizedStatus === "published" ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700">Registration</span>
            <span className={`text-[11px] font-medium ${isRegistrationOpen ? "text-emerald-600" : "text-slate-400"}`}>
              {isRegistrationOpen ? "Open for bookings" : "Closed"}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isRegistrationOpen}
            aria-label={`Toggle registration for ${event.title || "event"}`}
            onClick={() => onToggleRegistration(event.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 ${isRegistrationOpen ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${isRegistrationOpen ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      ) : null}

      {isAdmin && event.vendors?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.vendors.map((assigned) => (
            <span key={assigned.vendorId} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px]">
              {vendorMap.get(assigned.vendorId)?.name || assigned.vendorId} ({formatINR(assigned.agreedCost)})
              {assigned.vendorId === event.approvedVendorId ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Approved
                </span>
              ) : null}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Remove vendor ${vendorMap.get(assigned.vendorId)?.name || assigned.vendorId} from ${event.title || "event"}`}
                    className="text-red-800 hover:underline"
                  >
                    Remove
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Vendor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove {vendorMap.get(assigned.vendorId)?.name || "this vendor"} from the event? 
                      This will delete their assignment and agreed budget cost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemoveVendor(event.id, assigned.vendorId)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
