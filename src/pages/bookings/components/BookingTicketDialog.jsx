import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function BookingTicketDialog({
  isDownloadingTicket,
  isGeneratingQr,
  onClose,
  onDownloadPdf,
  onDownloadPng,
  selectedTicket,
  ticketQrCodeUrl,
}) {
  return (
    <Dialog
      open={Boolean(selectedTicket)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ticket QR</DialogTitle>
          <DialogDescription>
            Show this QR code at venue entry for fast check-in.
          </DialogDescription>
        </DialogHeader>

        {selectedTicket ? (
          <div className="space-y-4">
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{selectedTicket.title}</p>
                <p className="mt-1">Booking ID: {selectedTicket.bookingId}</p>
                <p>{selectedTicket.date}</p>
                <p>{selectedTicket.seats}</p>
                <p>{selectedTicket.location}</p>
                <p>Booked on {selectedTicket.bookedAt}</p>
                <p className="font-semibold text-slate-900">{selectedTicket.price}</p>
              </div>

              <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-4">
                {isGeneratingQr ? (
                  <p className="text-sm text-slate-500">Generating QR code...</p>
                ) : ticketQrCodeUrl ? (
                  <img
                    src={ticketQrCodeUrl}
                    alt={`Ticket QR for booking ${selectedTicket.bookingId}`}
                    className="h-64 w-64"
                  />
                ) : (
                  <p className="text-sm text-red-700">QR code unavailable.</p>
                )}
              </div>
            </div>

            {ticketQrCodeUrl ? (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={onDownloadPng}
                  disabled={isDownloadingTicket}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
                >
                  {isDownloadingTicket ? "Preparing..." : "Download PNG"}
                </button>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isDownloadingTicket}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-60"
                >
                  {isDownloadingTicket ? "Preparing..." : "Download PDF"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
