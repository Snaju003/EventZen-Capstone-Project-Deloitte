import { Calendar, Clock, ExternalLink, MapPin, Navigation, QrCode, Ticket, Users } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function VenueMap({ address }) {
  const normalizedAddress = (address || "").trim();
  if (!normalizedAddress || normalizedAddress.toLowerCase() === "venue details unavailable") {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <MapPin className="h-6 w-6" />
          <span className="text-xs font-medium">Map unavailable</span>
        </div>
      </div>
    );
  }

  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(normalizedAddress)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(normalizedAddress)}`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      <iframe
        title={`Map for ${normalizedAddress}`}
        src={mapEmbedSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-[1000] flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-md backdrop-blur transition-all hover:bg-white hover:shadow-lg"
      >
        <ExternalLink className="h-3 w-3" />
        Get Directions
      </a>
    </div>
  );
}

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            Event Ticket
          </DialogTitle>
          <DialogDescription>
            Your booking confirmation with QR check-in and venue directions.
          </DialogDescription>
        </DialogHeader>

        {selectedTicket ? (
          <div className="space-y-4">
            {/* Top section: Ticket details + QR code side by side */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
              {/* Ticket Details */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                <h3 className="text-lg font-bold text-slate-900">{selectedTicket.title}</h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <QrCode className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">Booking ID:</span>
                    <span className="font-mono text-xs text-slate-500">{selectedTicket.bookingId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedTicket.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedTicket.seats}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedTicket.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Booked on {selectedTicket.bookedAt}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <span className="text-xl font-bold text-primary">{selectedTicket.price}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4">
                {isGeneratingQr ? (
                  <div className="flex h-40 w-40 items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <QrCode className="h-8 w-8 animate-pulse" />
                      <span className="text-xs font-medium">Generating...</span>
                    </div>
                  </div>
                ) : ticketQrCodeUrl ? (
                  <img
                    src={ticketQrCodeUrl}
                    alt={`Ticket QR for booking ${selectedTicket.bookingId}`}
                    className="h-40 w-40"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center">
                    <p className="text-xs text-red-500">QR unavailable</p>
                  </div>
                )}
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">Scan at entry</p>
              </div>
            </div>

            {/* Venue Map */}
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center gap-2">
                <Navigation className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue Location</span>
              </div>
              <div className="h-48 w-full">
                <VenueMap address={selectedTicket.location} />
              </div>
            </div>

            {/* Download Buttons */}
            {ticketQrCodeUrl ? (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={onDownloadPng}
                  disabled={isDownloadingTicket}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60"
                >
                  {isDownloadingTicket ? "Preparing..." : "Download PNG"}
                </button>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  disabled={isDownloadingTicket}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
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
