import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PublishBudgetDialog({
  isPublishing,
  onChangeOpen,
  onConfirm,
  onValueChange,
  onCancel,
  publishDialog,
}) {
  return (
    <Dialog open={publishDialog.open} onOpenChange={onChangeOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Total Budget Before Publish</DialogTitle>
          <DialogDescription>
            Enter the total budget for <span className="font-semibold text-slate-800">{publishDialog.eventTitle}</span>. This is required to approve and publish the event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700" htmlFor="publish-total-budget">Total Budget</label>
          <input
            id="publish-total-budget"
            type="number"
            min="0"
            step="0.01"
            value={publishDialog.totalBudget}
            onChange={(event) => onValueChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 px-3"
            placeholder="e.g. 500000"
            disabled={isPublishing}
            required
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPublishing}
            className="h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPublishing ? "Publishing..." : "Approve & Publish"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
