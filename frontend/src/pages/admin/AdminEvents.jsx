import { Suspense, lazy } from "react";
import { motion } from "framer-motion";

import { Footer } from "@/components/layout/Footer";
import { AdminEventCard } from "@/pages/admin/components/events/AdminEventCard";
import { AdminEventsToolbar } from "@/pages/admin/components/events/AdminEventsToolbar";
import { ApprovalQueue } from "@/pages/admin/components/events/ApprovalQueue";
import { EventPaginationControls } from "@/pages/admin/components/events/EventPaginationControls";
import { useAdminEventMutations } from "@/pages/admin/hooks/useAdminEventMutations";
import { useAdminEventsPage } from "@/pages/admin/hooks/useAdminEventsPage";

const EventEditorDialog = lazy(() =>
  import("@/pages/admin/components/events/EventEditorDialog").then((m) => ({ default: m.EventEditorDialog }))
);
const RejectEventDialog = lazy(() =>
  import("@/pages/admin/components/RejectEventDialog").then((m) => ({ default: m.RejectEventDialog }))
);
const PublishBudgetDialog = lazy(() =>
  import("@/pages/admin/components/events/PublishBudgetDialog").then((m) => ({ default: m.PublishBudgetDialog }))
);

export default function AdminEvents() {
  const page = useAdminEventsPage();
  const actions = useAdminEventMutations(page);

  const {
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
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-48 w-48 bg-sky-300/20" />
      <div className="soft-orb right-[-4rem] top-36 h-44 w-44 bg-indigo-200/25" style={{ animationDelay: "1.1s" }} />

      <main className="page-shell flex-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            {isAdmin ? "Administration" : "Vendor Portal"}
          </p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>
            {isAdmin ? "Event Management" : "My Event Requests"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            {isAdmin
              ? "Review pending requests, approve or reject them, and manage published events."
              : "Create event requests, track approval status, and update your submissions."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        >
          <AdminEventsToolbar
            eventCounts={eventCounts}
            onCreate={openCreateDialog}
            onSearchChange={actions.handleSearchChange}
            onStatusChange={actions.handleStatusChange}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        </motion.div>

        {loadError ? (
          <div role="alert" className="mb-6 rounded-xl border border-red-300/70 bg-red-100/90 p-4 text-sm text-red-900 shadow-sm">
            <p>{loadError}</p>
            <button type="button" onClick={loadData} className="focus-polish mt-2 text-sm font-semibold underline">Retry</button>
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

        {isLoading ? (
          <div role="status" aria-live="polite" className="rounded-xl border border-slate-200 bg-white/80 p-6 text-center text-slate-500 backdrop-blur">
            Loading events...
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {events.map((event) => (
                <AdminEventCard
                  key={event.id}
                  event={event}
                  isAdmin={isAdmin}
                  onCancelEvent={actions.onCancelEvent}
                  onDeleteEvent={actions.onDeleteEvent}
                  onEdit={page.startEdit}
                  onOpenPublishDialog={actions.openPublishDialog}
                  onOpenRejectDialog={actions.openRejectDialog}
                  onRemoveVendor={actions.onRemoveVendor}
                  onToggleRegistration={actions.onToggleRegistration}
                  venueMap={venueMap}
                  vendorMap={vendorMap}
                />
              ))}

              {events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500 md:col-span-2 lg:col-span-3">
                  No events found for this filter.
                </div>
              ) : null}
            </motion.div>

            <EventPaginationControls
              isLoading={isLoading}
              onNext={() => setCurrentPage((previous) => previous + 1)}
              onPrevious={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              pageMeta={pageMeta}
            />
          </>
        )}

        <Suspense fallback={null}>
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
            vendors={vendors}
            allEvents={events}
          />

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
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

