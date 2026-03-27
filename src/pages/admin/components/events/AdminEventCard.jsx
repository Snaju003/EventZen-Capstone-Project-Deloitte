import { Link, useNavigate } from "react-router-dom";
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
  assignmentDraft,
  event,
  isAdmin,
  onApproveVendor,
  onAssignmentChange,
  onAssignVendor,
  onCancelEvent,
  onDeleteEvent,
  onEdit,
  onOpenPublishDialog,
  onOpenRejectDialog,
  onRemoveVendor,
  venueMap,
  vendorMap,
  vendors,
}) {
  const navigate = useNavigate();
  const normalizedStatus = (event.status || "draft").toLowerCase();
  const { label: statusBadgeLabel, className: statusBadgeClass } = getStatusBadge(normalizedStatus);

  const hasVendorAssignments = Array.isArray(event.vendors) && event.vendors.length > 0;
  const hasCreatorVendorAssignment = hasVendorAssignments && event.vendors.some((assignedVendor) => {
    const vendorUserId = vendorMap.get(assignedVendor.vendorId)?.userId;
    return Boolean(vendorUserId) && vendorUserId === event.createdBy;
  });
  const shouldShowVendorControls = isAdmin && !hasCreatorVendorAssignment;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <ImageCarousel images={event.imageUrls} altPrefix={event.title || "Event"} className="mb-4 h-44" />

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900">{event.title || "Untitled event"}</h3>
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

      <div className="mt-4 space-y-2">
        {shouldShowVendorControls ? (
          <div className="grid grid-cols-1 gap-2">
            <select
              aria-label={`Select vendor for ${event.title || "event"}`}
              value={assignmentDraft?.vendorId || ""}
              onChange={(inputEvent) => onAssignmentChange(event.id, { vendorId: inputEvent.target.value })}
              className="h-10 rounded-md border border-slate-200 px-2"
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
            <input
              aria-label={`Agreed vendor cost for ${event.title || "event"}`}
              type="number"
              min="0"
              step="0.01"
              value={assignmentDraft?.agreedCost || ""}
              onChange={(inputEvent) => onAssignmentChange(event.id, { agreedCost: inputEvent.target.value })}
              placeholder="Agreed cost"
              className="h-10 rounded-md border border-slate-200 px-2"
            />
            <button
              type="button"
              onClick={() => onAssignVendor(event.id)}
              aria-label={`Assign selected vendor to ${event.title || "event"}`}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium"
            >
              Assign vendor
            </button>
            <button
              type="button"
              onClick={() => onApproveVendor(event.id)}
              aria-label={`Set approved vendor for ${event.title || "event"}`}
              className="h-10 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700"
            >
              Set Approved Vendor
            </button>
          </div>
        ) : null}

        {isAdmin && hasCreatorVendorAssignment ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Vendor and agreed cost were provided by the event creator. No additional assignment is needed.
          </p>
        ) : null}
      </div>

      {isAdmin && event.vendors?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {event.vendors.map((assigned) => (
            <span key={assigned.vendorId} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
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
