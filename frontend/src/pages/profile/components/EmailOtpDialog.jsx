import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP } from "@/components/ui/input-otp";

export function EmailOtpDialog({
  emailOtp,
  isEmailChanged,
  isLoading,
  isOpen,
  normalizedEmailInput,
  onChangeOpen,
  onOtpChange,
  onRequestOtp,
  onVerifyOtp,
  otpMatchesCurrentEmail,
  otpRequestedForEmail,
  resendSecondsLeft,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onChangeOpen}>
      <DialogContent className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-0 text-slate-100 ring-0">
        <div className="p-5">
          <DialogHeader>
            <DialogTitle className="text-lg text-slate-100" style={{ fontFamily: "var(--font-serif)" }}>
              Verify New Email
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Enter the 6-digit OTP sent to <span className="font-semibold text-slate-100">{otpRequestedForEmail || normalizedEmailInput}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <InputOTP
              value={emailOtp}
              onChange={onOtpChange}
              maxLength={6}
              autoFocus
              disabled={isLoading}
              className="justify-center"
              inputClassName="border-white/20 bg-white/10 text-white focus:border-sky-300 focus:ring-sky-300"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-white/10 bg-white/5 px-5 py-4 sm:gap-2">
          <button
            type="button"
            onClick={onRequestOtp}
            disabled={isLoading || !isEmailChanged || resendSecondsLeft > 0}
            className="h-10 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            onClick={onVerifyOtp}
            disabled={isLoading || !otpMatchesCurrentEmail || emailOtp.length !== 6}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Verify & Update Email
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
