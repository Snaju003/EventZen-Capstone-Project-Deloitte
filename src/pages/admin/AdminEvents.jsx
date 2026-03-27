import { RejectEventDialog } from "@/pages/admin/components/RejectEventDialog";
import { AdminEventCard } from "@/pages/admin/components/events/AdminEventCard";
import { AdminEventsToolbar } from "@/pages/admin/components/events/AdminEventsToolbar";
import { ApprovalQueue } from "@/pages/admin/components/events/ApprovalQueue";
import { EventEditorDialog } from "@/pages/admin/components/events/EventEditorDialog";
import { EventPaginationControls } from "@/pages/admin/components/events/EventPaginationControls";
import { PublishBudgetDialog } from "@/pages/admin/components/events/PublishBudgetDialog";
import { useAdminEventMutations } from "@/pages/admin/hooks/useAdminEventMutations";
import { useAdminEventsPage } from "@/pages/admin/hooks/useAdminEventsPage";

export default function AdminEvents() {
  const page = useAdminEventsPage();
  const actions = useAdminEventMutations(page);

  const {
    assignmentDrafts,
    editingId,
    eventCounts,
    events,
    form,
    isAdmin,
    isFormDialogOpen,
    isLoading,
    isPublishing,
    isRejecting,
    loadData,
    loadError,
    openCreateDialog,
    pageMeta,
    pendingApprovalEvents,
    publishDialog,
    rejectionDialog,
    resetForm,
    searchTerm,
    setCurrentPage,
    setForm,
    setIsFormDialogOpen,
    setPublishDialog,
    setRejectionDialog,
    statusFilter,
    submitting,
    uploadingImages,
    venues,
    venueMap,
    vendors,
    vendorMap,
  } = page;

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">{isAdmin ? "Event Management" : "My Event Requests"}</h1>
          <p className="text-slate-500">
            {isAdmin
              ? "Review pending requests, approve or reject them, and manage published events."
              : "Create event requests, track approval status, and update your submissions."}
          </p>
        </div>

        <AdminEventsToolbar
          eventCounts={eventCounts}
          onCreate={openCreateDialog}
          onSearchChange={actions.handleSearchChange}
          onStatusChange={actions.handleStatusChange}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />

        {loadError ? (
          <div role="alert" className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{loadError}</p>
            <button type="button" onClick={loadData} className="mt-2 font-semibold underline">Retry</button>
          </div>
        ) : null}

        {isAdmin ? (
          <ApprovalQueue
            events={pendingApprovalEvents}
            onPublish={actions.openPublishDialog}
            onReject={actions.openRejectDialog}
            venueMap={venueMap}
          />
        ) : null}

        <EventEditorDialog
          editingId={editingId}
          form={form}
          isAdmin={isAdmin}
          isOpen={isFormDialogOpen}
          onClose={page.closeFormDialog}
          onImageUpload={actions.handleImageUpload}
          onImageDrop={actions.handleImageDrop}
          onOpenChange={(open) => {
            setIsFormDialogOpen(open);
            if (!open) resetForm();
          }}
          onRemoveImage={actions.removeImageAtIndex}
          onSubmit={actions.handleSubmit}
          previewDescription={actions.previewDescription}
          previewImages={actions.previewImages}
          previewStartTime={actions.previewStartTime}
          previewTitle={actions.previewTitle}
          previewVenue={actions.previewVenue}
          setForm={setForm}
          submitting={submitting}
          uploadingImages={uploadingImages}
          venues={venues}
          allEvents={events}
        />

        {isLoading ? (
          <div role="status" aria-live="polite" className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading events...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <AdminEventCard
                  key={event.id}
                  assignmentDraft={assignmentDrafts[event.id]}
                  event={event}
                  isAdmin={isAdmin}
                  onApproveVendor={actions.approveSelectedVendor}
                  onAssignmentChange={actions.onAssignmentChange}
                  onAssignVendor={actions.assignVendor}
                  onCancelEvent={actions.onCancelEvent}
                  onDeleteEvent={actions.onDeleteEvent}
                  onEdit={page.startEdit}
                  onOpenPublishDialog={actions.openPublishDialog}
                  onOpenRejectDialog={actions.openRejectDialog}
                  onRemoveVendor={actions.onRemoveVendor}
                  venueMap={venueMap}
                  vendorMap={vendorMap}
                  vendors={vendors}
                />
              ))}

              {events.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500 md:col-span-2 lg:col-span-3">
                  No events found for this filter.
                </div>
              ) : null}
            </div>

            <EventPaginationControls
              isLoading={isLoading}
              onNext={() => setCurrentPage((previous) => previous + 1)}
              onPrevious={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              pageMeta={pageMeta}
            />
          </>
        )}

        <RejectEventDialog
          open={rejectionDialog.open}
          eventTitle={rejectionDialog.eventTitle}
          reason={rejectionDialog.reason}
          onReasonChange={(value) => setRejectionDialog((previous) => ({ ...previous, reason: value }))}
          onCancel={actions.closeRejectDialog}
          onConfirm={actions.confirmRejectEvent}
          isSubmitting={isRejecting}
        />

        <PublishBudgetDialog
          isPublishing={isPublishing}
          onChangeOpen={(open) => {
            if (!open && !isPublishing) {
              actions.closePublishDialog();
            }
          }}
          onConfirm={actions.confirmApproveAndPublish}
          onValueChange={(value) => setPublishDialog((previous) => ({ ...previous, totalBudget: value }))}
          onCancel={actions.closePublishDialog}
          publishDialog={publishDialog}
        />
      </main>
    </div>
  );
}
