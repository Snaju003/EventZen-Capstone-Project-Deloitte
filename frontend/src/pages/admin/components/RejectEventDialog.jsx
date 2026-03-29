import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RejectEventDialog({
  open,
  eventTitle,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  isSubmitting,
}) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Event Request</AlertDialogTitle>
          <AlertDialogDescription>
            Share a clear reason so the vendor knows what to update before resubmitting.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Event: <span className="text-slate-900">{eventTitle || "Untitled event"}</span>
          </p>
          <label className="block text-sm font-medium text-slate-700" htmlFor="rejection-reason">
            Rejection reason
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Explain what should be corrected before approval."
            className="min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-primary/20 focus:border-primary focus:ring-2"
            maxLength={500}
          />
          <p className="text-xs text-slate-500">{reason.trim().length}/500 characters</p>
        </div>

        <AlertDialogFooter className="-mx-0 -mb-0 border-t-0 bg-transparent p-0 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
          >
            Keep Event
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-red-300 bg-red-100 px-4 text-sm font-semibold text-red-900 disabled:opacity-60"
          >
            {isSubmitting ? "Rejecting..." : "Reject Event"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
