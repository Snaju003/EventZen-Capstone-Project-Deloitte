import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Camera, CameraOff, CheckCircle2, Scan, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { checkInBooking } from "@/lib/bookings-api";
import { getApiErrorMessage } from "@/lib/auth-api";
import { Footer } from "@/components/layout/Footer";

const SCAN_STATUS = {
  IDLE: "idle",
  SCANNING: "scanning",
  SUCCESS: "success",
  ERROR: "error",
};

const QR_PREFIX = "EVENTZEN-TICKET";

function parseQrCode(rawText) {
  const parts = rawText.split("|");
  if (parts.length < 3 || parts[0] !== QR_PREFIX) {
    return null;
  }
  return {
    bookingId: parts[1],
    eventId: parts[2],
    seatCount: parts[3] ? Number(parts[3]) : null,
  };
}

export default function VendorCheckIn() {
  const { eventId } = useParams();

  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState(SCAN_STATUS.IDLE);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const html5QrRef = useRef(null);
  const scannerContainerId = "vendor-qr-reader";
  const processingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrRef.current) {
        const state = html5QrRef.current.getState();
        if (state === 2) {
          await html5QrRef.current.stop();
        }
        html5QrRef.current.clear();
        html5QrRef.current = null;
      }
    } catch {
      // Scanner may already be stopped
    }
    setCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsProcessing(true);

      const parsed = parseQrCode(decodedText);
      if (!parsed) {
        setScanStatus(SCAN_STATUS.ERROR);
        setErrorMessage("Invalid QR code format. This does not appear to be an EventZen ticket.");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      if (parsed.eventId !== eventId) {
        setScanStatus(SCAN_STATUS.ERROR);
        setErrorMessage("This ticket belongs to a different event.");
        processingRef.current = false;
        setIsProcessing(false);
        return;
      }

      try {
        await stopScanner();
        const response = await checkInBooking({
          bookingId: parsed.bookingId,
          eventId: parsed.eventId,
        });

        setScanStatus(SCAN_STATUS.SUCCESS);
        setResultData({
          attendeeName: response.attendeeName || "Attendee",
          seatCount: response.seatCount || parsed.seatCount || 1,
        });
        toast.success("Check-in successful!");
      } catch (err) {
        setScanStatus(SCAN_STATUS.ERROR);
        setErrorMessage(getApiErrorMessage(err, "Check-in failed. Please try again."));
      } finally {
        processingRef.current = false;
        setIsProcessing(false);
      }
    },
    [eventId, stopScanner],
  );

  const startScanner = useCallback(async () => {
    setScanStatus(SCAN_STATUS.SCANNING);
    setResultData(null);
    setErrorMessage("");

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        handleScanSuccess,
        () => {},
      );

      setCameraActive(true);
    } catch (err) {
      setScanStatus(SCAN_STATUS.ERROR);
      setErrorMessage(
        err?.message?.includes("NotAllowed")
          ? "Camera access was denied. Please allow camera permissions and try again."
          : "Unable to start camera. Please check your device settings.",
      );
    }
  }, [handleScanSuccess]);

  const resetScanner = useCallback(() => {
    setScanStatus(SCAN_STATUS.IDLE);
    setResultData(null);
    setErrorMessage("");
    processingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try {
          const state = html5QrRef.current.getState();
          if (state === 2) {
            html5QrRef.current.stop().then(() => html5QrRef.current?.clear());
          } else {
            html5QrRef.current.clear();
          }
        } catch {
          // Cleanup errors are fine
        }
      }
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-44 w-44 bg-violet-300/20" />
      <div className="soft-orb right-[-3rem] top-44 h-40 w-40 bg-indigo-200/30" style={{ animationDelay: "1.2s" }} />

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-12 sm:px-6">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </motion.div>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Scan className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Attendee Check-In</h1>
          <p className="mt-1 text-sm text-slate-500">Scan QR codes to check in attendees</p>
        </motion.div>

        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {/* Camera viewport */}
          <div className="relative aspect-square w-full overflow-hidden bg-slate-900">
            <div id={scannerContainerId} className="h-full w-full" />

            {!cameraActive && scanStatus !== SCAN_STATUS.SUCCESS && scanStatus !== SCAN_STATUS.ERROR && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900">
                {scanStatus === SCAN_STATUS.IDLE ? (
                  <>
                    <CameraOff className="h-12 w-12 text-slate-500" />
                    <p className="text-sm text-slate-400">Camera is not active</p>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-violet-500" />
                    <p className="text-sm text-slate-400">Starting camera...</p>
                  </>
                )}
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80 backdrop-blur-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-violet-500" />
                <p className="text-sm font-medium text-white">Verifying ticket...</p>
              </div>
            )}
          </div>

          {/* Result / Action area */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {scanStatus === SCAN_STATUS.IDLE && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={startScanner}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98]"
                  >
                    <Camera className="h-4 w-4" />
                    Start Scanner
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Point the camera at the attendee&apos;s QR code.
                  </p>
                </motion.div>
              )}

              {scanStatus === SCAN_STATUS.SCANNING && !isProcessing && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                    Scanning for QR codes...
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await stopScanner();
                      resetScanner();
                    }}
                    className="text-xs font-semibold text-slate-500 underline transition-colors hover:text-slate-700"
                  >
                    Stop camera
                  </button>
                </motion.div>
              )}

              {scanStatus === SCAN_STATUS.SUCCESS && resultData && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{resultData.attendeeName}</p>
                    <p className="text-sm text-slate-500">
                      {resultData.seatCount} {resultData.seatCount === 1 ? "seat" : "seats"} — Checked In ✓
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetScanner();
                      setTimeout(() => startScanner(), 100);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98]"
                  >
                    <Scan className="h-4 w-4" />
                    Scan Next Attendee
                  </button>
                </motion.div>
              )}

              {scanStatus === SCAN_STATUS.ERROR && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-9 w-9 text-red-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-red-800">Check-in Failed</p>
                    <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetScanner();
                      setTimeout(() => startScanner(), 100);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98]"
                  >
                    <Scan className="h-4 w-4" />
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">How it works</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-500">1.</span>
              Tap "Start Scanner" to activate the camera
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-500">2.</span>
              Point at the attendee&apos;s QR code from their email or bookings page
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-500">3.</span>
              The system verifies and marks the ticket as checked-in
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-500">4.</span>
              Each QR code can only be scanned once
            </li>
          </ul>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
