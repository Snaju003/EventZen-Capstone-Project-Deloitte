import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventFormDialog } from "@/pages/admin/components/EventFormDialog";
import { EventPreviewCard } from "@/pages/admin/components/events/EventPreviewCard";

export function EventEditorDialog({
  editingId,
  form,
  isAdmin,
  isOpen,
  onClose,
  onImageUpload,
  onOpenChange,
  onRemoveImage,
  onSubmit,
  previewDescription,
  previewImages,
  previewStartTime,
  previewTitle,
  previewVenue,
  setForm,
  submitting,
  uploadingImages,
  venues,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            Use this form to manage event details, timing, and venue assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
          <EventFormDialog
            form={form}
            setForm={setForm}
            venues={venues}
            isAdmin={isAdmin}
            editingId={editingId}
            submitting={submitting}
            uploadingImages={uploadingImages}
            onSubmit={onSubmit}
            onClose={onClose}
            onImageUpload={onImageUpload}
            onRemoveImage={onRemoveImage}
          />

          <EventPreviewCard
            editingId={editingId}
            previewDescription={previewDescription}
            previewImages={previewImages}
            previewStartTime={previewStartTime}
            previewTitle={previewTitle}
            previewVenue={previewVenue}
            ticketPrice={form.ticketPrice}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
