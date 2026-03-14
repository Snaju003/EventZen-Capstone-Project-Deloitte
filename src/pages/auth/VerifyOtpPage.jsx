import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogoIcon } from "@/components/ui/Icons";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showResentAlert, setShowResentAlert] = useState(false);
  const inputRefs = useRef([]);

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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isComplete) return;
    setShowResentAlert(false);
    navigate("/reset-password");
  };

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""]);
    setShowResentAlert(true);
    inputRefs.current[0]?.focus();
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
          <Alert className="mb-4 grid gap-1 rounded-xl">
            <AlertTitle>Enter the latest code</AlertTitle>
            <AlertDescription>
              If you requested a new OTP, only the most recently sent code will work.
            </AlertDescription>
          </Alert>

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

          <button
            type="submit"
            disabled={!isComplete}
            className="w-full h-11 rounded-[10px] bg-[#2e4057] text-white text-[0.9375rem] font-semibold hover:bg-[#253449] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e4057]"
          >
            Verify OTP
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-[#2e4057] hover:underline"
          >
            Resend
          </button>
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
