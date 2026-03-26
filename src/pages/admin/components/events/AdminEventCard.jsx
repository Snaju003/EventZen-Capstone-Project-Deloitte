import { Link } from "react-router-dom";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
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
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass}`}>
              {statusBadgeLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{event.description || "No description"}</p>
          <p className="mt-2 text-xs text-slate-500">
            Venue: {venueMap.get(event.venueId)?.name || "Unknown"}
          </p>
          {normalizedStatus === "rejected" ? (
            <p className="mt-1 text-xs font-medium text-rose-900">
              Rejection reason: {event.rejectionReason || "No reason provided."}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(event)}
            aria-label={`Edit ${event.title || "event"}`}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
          >
            Edit
          </button>

          {isAdmin && normalizedStatus === "draft" ? (
            <button
              type="button"
              onClick={() => onOpenPublishDialog(event)}
              aria-label={`Approve and publish ${event.title || "event"}`}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
            >
              Approve & Publish
            </button>
          ) : null}

          {isAdmin && normalizedStatus === "draft" ? (
            <button
              type="button"
              onClick={() => onOpenRejectDialog(event)}
              aria-label={`Reject ${event.title || "event"}`}
              className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900"
            >
              Reject
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onCancelEvent(event.id)}
            aria-label={`Cancel ${event.title || "event"}`}
            className="rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-sm text-amber-900"
          >
            Cancel
          </button>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => onDeleteEvent(event.id)}
              aria-label={`Delete ${event.title || "event"}`}
              className="rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-900"
            >
              Delete
            </button>
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

        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Link to={`/admin/events/${event.id}/attendees`} className="inline-flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm font-medium">
              Attendees
            </Link>
          ) : null}
          <Link to={`/admin/budget/${event.id}`} className="inline-flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm font-medium">
            Budget
          </Link>
        </div>
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
              <button
                type="button"
                onClick={() => onRemoveVendor(event.id, assigned.vendorId)}
                aria-label={`Remove vendor ${vendorMap.get(assigned.vendorId)?.name || assigned.vendorId} from ${event.title || "event"}`}
                className="text-red-800"
              >
                Remove
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
