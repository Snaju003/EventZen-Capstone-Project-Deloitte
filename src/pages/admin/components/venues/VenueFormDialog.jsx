import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function VenueFormDialog({
  editingId,
  form,
  isOpen,
  isSubmitting,
  isUploadingImages,
  onClose,
  onImageUpload,
  onOpenChange,
  onRemoveImage,
  onSubmit,
  setForm,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Venue" : "Create Venue"}</DialogTitle>
          <DialogDescription>
            Use this form to manage venue details and images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
            placeholder="Venue name"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3"
            required
          />

          <input
            value={form.capacity}
            onChange={(event) => setForm((previous) => ({ ...previous, capacity: event.target.value }))}
            placeholder="Capacity"
            type="number"
            min="1"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3"
            required
          />

          <input
            value={form.address}
            onChange={(event) => setForm((previous) => ({ ...previous, address: event.target.value }))}
            placeholder="Address"
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 md:col-span-2"
            required
          />

          <textarea
            value={form.description}
            onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
            placeholder="Description"
            className="min-h-20 rounded-lg border border-slate-200 bg-white px-3 py-2 md:col-span-2"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Venue Images</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={onImageUpload}
              disabled={isUploadingImages || isSubmitting}
              className="block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-50 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            <p className="mt-1 text-xs text-slate-500">Upload up to 10 images. Supported: JPG, PNG, WEBP.</p>

            {isUploadingImages ? <p className="mt-2 text-sm text-primary">Uploading images...</p> : null}

            {form.imageUrls?.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {form.imageUrls.map((url, index) => (
                  <div key={`${url}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img src={url} alt={`Venue upload ${index + 1}`} className="h-20 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex gap-2 md:col-span-2">
            <button type="submit" disabled={isSubmitting} className="h-11 rounded-lg bg-primary px-4 font-semibold text-white disabled:bg-slate-300">
              {isSubmitting ? "Saving..." : editingId ? "Update Venue" : "Create Venue"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploadingImages}
              className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
