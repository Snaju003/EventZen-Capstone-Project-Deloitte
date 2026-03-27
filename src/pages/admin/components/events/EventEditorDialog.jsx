import { useEffect, useState } from "react";

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
  onImageDrop,
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
  const [isDialogDragActive, setIsDialogDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsDialogDragActive(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const preventBrowserFileOpen = (event) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", preventBrowserFileOpen);
    window.addEventListener("drop", preventBrowserFileOpen);

    return () => {
      window.removeEventListener("dragover", preventBrowserFileOpen);
      window.removeEventListener("drop", preventBrowserFileOpen);
    };
  }, [isOpen]);

  const handleDialogDragOver = (event) => {
    event.preventDefault();
    if (uploadingImages || submitting) {
      return;
    }
    setIsDialogDragActive(true);
  };

  const handleDialogDragLeave = () => {
    setIsDialogDragActive(false);
  };

  const handleDialogDrop = async (event) => {
    event.preventDefault();
    setIsDialogDragActive(false);

    if (uploadingImages || submitting) {
      return;
    }

    const files = event.dataTransfer?.files;
    if (!files?.length) {
      return;
    }

    await onImageDrop(files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={`relative z-[70] max-h-[90vh] overflow-y-auto bg-white sm:max-w-5xl ${isDialogDragActive ? "ring-2 ring-primary/50" : ""}`}
      >
        <div
          className="relative"
          onDragOver={handleDialogDragOver}
          onDragLeave={handleDialogDragLeave}
          onDrop={handleDialogDrop}
        >
          {isDialogDragActive ? (
            <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/70 bg-primary/10">
              <p className="rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-primary shadow-sm">Drop images anywhere in this dialog to upload</p>
            </div>
          ) : null}

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
              onImageDrop={onImageDrop}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
