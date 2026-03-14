import { useRef, useState } from "react";
import { BadgeCheck, RotateCcw } from "lucide-react";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogoIcon } from "@/components/ui/Icons";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, verifyOtpSchema } from "@/lib/auth-schemas";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isLoading,
    pendingVerification,
    resendOtp,
    setPendingVerification,
    verifyOtp,
  } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showResentAlert, setShowResentAlert] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    location.state?.statusMessage || "",
  );
  const inputRefs = useRef([]);
  const currentEmail = location.state?.email || pendingVerification.email;
  const currentPurpose = location.state?.purpose || pendingVerification.purpose;

  const isComplete = otp.every((digit) => digit !== "");

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const cleanValue = value.slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = cleanValue;
    setOtp(nextOtp);

    if (cleanValue && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    if (!isComplete || !currentEmail) return;
    setShowResentAlert(false);

    const otpValue = otp.join("");
    const parsedValues = verifyOtpSchema.safeParse({
      email: currentEmail,
      otp: otpValue,
    });

    if (!parsedValues.success) {
      setSubmitError(
        getFieldErrors(parsedValues.error).otp?.[0] ||
          parsedValues.error.issues[0]?.message,
      );
      return;
    }

    try {
      const result = await verifyOtp(parsedValues.data);

      if (currentPurpose === "password-reset") {
        navigate("/reset-password", {
          state: {
            email: currentEmail,
            statusMessage: result.message || "OTP verified successfully.",
          },
        });
        return;
      }

      navigate("/", {
        state: {
          activeTab: "login",
          statusMessage: result.message || "Account verified. You can now log in.",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setSubmitError(
          getFieldErrors(error).otp?.[0] || error.issues[0]?.message,
        );
        return;
      }

      setSubmitError(
        getApiErrorMessage(error, "OTP verification failed. Please try again."),
      );
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setSubmitError("");

    if (!currentEmail) {
      setSubmitError("We could not find the email for this verification attempt.");
      return;
    }

    try {
      await resendOtp(currentEmail);
      setPendingVerification({
        email: currentEmail,
        purpose: currentPurpose || "register",
      });
      setShowResentAlert(true);
      setStatusMessage("");
      inputRefs.current[0]?.focus();
    } catch (error) {
      setShowResentAlert(false);
      setSubmitError(
        getApiErrorMessage(error, "We could not resend the OTP. Please try again."),
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-slate-50">
      <div
        className="w-full max-w-md bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 animate-[fadeUp_0.38s_ease_both]"
        style={{ animation: "fadeUp 0.38s ease both" }}
      >
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-2.5 text-[#2e4057] mb-6">
            <LogoIcon />
            <span
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              EventZen
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 text-center">
            Verify OTP
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {statusMessage ? (
            <Alert className="mb-4 grid gap-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
              <AlertTitle>Code sent</AlertTitle>
              <AlertDescription className="text-emerald-700">
                {statusMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <Alert className="mb-4 grid gap-1 rounded-xl">
            <AlertTitle>Enter the latest code</AlertTitle>
            <AlertDescription>
              {currentEmail
                ? `Enter the 6-digit code sent to ${currentEmail}.`
                : "If you requested a new OTP, only the most recently sent code will work."}
            </AlertDescription>
          </Alert>

          {submitError ? (
            <Alert variant="destructive" className="mb-4 grid gap-1 rounded-xl">
              <AlertTitle>Verification failed</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {showResentAlert ? (
            <Alert className="mb-4 grid gap-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
              <AlertTitle>OTP sent again</AlertTitle>
              <AlertDescription className="text-emerald-700">
                A fresh 6-digit code has been sent. Please check your email.
              </AlertDescription>
            </Alert>
          ) : null}

          <fieldset className="flex justify-center gap-2 sm:gap-3 mb-7">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-12 w-10 sm:w-11 rounded-[10px] border border-slate-200 text-center text-lg font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[#2e4057] focus:border-transparent"
                autoFocus={index === 0}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </fieldset>

          <Button
            type="submit"
            disabled={!isComplete || !currentEmail || isLoading}
            className="w-full"
          >
            <BadgeCheck className="size-4" />
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Didn't receive the code?{" "}
          <Button
            type="button"
            onClick={handleResend}
            variant="link"
            size="sm"
            className="h-auto p-0 align-baseline"
            disabled={isLoading || !currentEmail}
          >
            <RotateCcw className="size-3.5" />
            Resend
          </Button>
        </div>

        <div className="mt-2 text-center text-sm text-slate-500">
          <Link to="/forget-password" className="font-semibold text-[#2e4057] hover:underline">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
