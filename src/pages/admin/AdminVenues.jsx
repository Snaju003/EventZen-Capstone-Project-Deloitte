import { VenueCard } from "@/pages/admin/components/venues/VenueCard";
import { VenueFormDialog } from "@/pages/admin/components/venues/VenueFormDialog";
import { useAdminVenuesPage } from "@/pages/admin/hooks/useAdminVenuesPage";

export default function AdminVenues() {
  const {
    closeFormDialog,
    deletingVenueId,
    editingId,
    form,
    handleImageUpload,
    isFormDialogOpen,
    isLoading,
    isSubmitting,
    isUploadingImages,
    openCreateDialog,
    removeImageAtIndex,
    removeVenue,
    resetForm,
    setForm,
    setIsFormDialogOpen,
    startEdit,
    submitVenue,
    venues,
  } = useAdminVenuesPage();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-44 w-44 bg-cyan-200/25" />
      <div className="soft-orb right-[-3rem] top-36 h-40 w-40 bg-sky-300/20" style={{ animationDelay: "1.2s" }} />

      <main className="page-shell flex-1">
        <div className="animate-rise mb-6">
          <h1 className="section-title">Admin Venues</h1>
          <p className="mt-1 text-slate-600">Create, edit, and remove venue records.</p>
        </div>

        <section className="hero-gradient-panel animate-rise delay-1 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Venue Inventory</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Maintain high-quality venue records with images, capacity details, and descriptions for fast selection.</p>
        </section>

        <section className="surface-card animate-rise delay-2 mb-8 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-slate-600">Create and edit venues in a dialog without leaving the list.</p>
          <button
            type="button"
            onClick={openCreateDialog}
            disabled={isSubmitting || isUploadingImages || deletingVenueId !== ""}
            className="button-polish focus-polish h-10 bg-primary px-4 text-sm text-white disabled:opacity-60"
          >
            Create Venue
          </button>
        </section>

        <VenueFormDialog
          editingId={editingId}
          form={form}
          isOpen={isFormDialogOpen}
          isSubmitting={isSubmitting}
          isUploadingImages={isUploadingImages}
          onClose={closeFormDialog}
          onImageUpload={handleImageUpload}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
          onRemoveImage={removeImageAtIndex}
          onSubmit={submitVenue}
          setForm={setForm}
        />

        {isLoading ? (
          <div className="surface-card animate-fade delay-3 p-6 text-center text-slate-600">Loading venues...</div>
        ) : (
          <div className="animate-fade delay-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                deletingVenueId={deletingVenueId}
                isSubmitting={isSubmitting}
                onDelete={removeVenue}
                onEdit={startEdit}
              />
            ))}

            {venues.length === 0 ? (
              <div className="surface-card p-6 text-center text-slate-600 md:col-span-2">No venues available.</div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
