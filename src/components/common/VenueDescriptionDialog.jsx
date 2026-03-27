import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VenueDescriptionDialog({
  address,
  capacity,
  description,
  isOpen,
  name,
  onOpenChange,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{name || "Venue details"}</DialogTitle>
          <DialogDescription>
            {address || "Address unavailable"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Capacity: {Number(capacity || 0)}</p>
          <p className="max-h-[52vh] overflow-y-auto whitespace-pre-line text-sm leading-6 text-slate-600">
            {(description || "No venue description available.").trim()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
