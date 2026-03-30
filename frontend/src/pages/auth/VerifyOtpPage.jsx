import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Fingerprint, RotateCcw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { LogoIcon } from "@/components/ui/Icons";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, verifyOtpSchema } from "@/lib/auth-schemas";
import { getRoleHomePath } from "@/lib/role-home";
import { OtpDigitFields } from "./components/OtpDigitFields";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isLoading,
    pendingVerification,
    resendOtp,
    setPendingVerification,
    verifyOtp,
    verifyResetOtp,
  } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const currentEmail = location.state?.email || pendingVerification.email;
  const currentPurpose = location.state?.purpose || pendingVerification.purpose;

  const isComplete = otp.every((digit) => digit !== "");

  const getPostLoginPath = (nextUser) => {
    const roleHomePath = getRoleHomePath(nextUser?.role);

    let path = location.state?.from;
    if (!path || path === "/" || path === "/profile") {
      path = roleHomePath;
    }

    return path;
  };

  useEffect(() => {
    const statusMessage = location.state?.statusMessage;

    if (!statusMessage) return;

    toast.success(statusMessage, { id: "otp-status" });

    // Consume one-time navigation message so it does not replay on refresh.
    navigate(location.pathname, {
      replace: true,
      state: {
        email: location.state?.email,
        purpose: location.state?.purpose,
      },
    });
  }, [location.pathname, location.state, navigate]);

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

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    const nextOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      nextOtp[i] = pasted[i] || "";
    }
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete || !currentEmail) return;

    const otpValue = otp.join("");
    const parsedValues = verifyOtpSchema.safeParse({
      email: currentEmail,
      otp: otpValue,
    });

    if (!parsedValues.success) {
      toast.error(
        getFieldErrors(parsedValues.error).otp?.[0] ||
        parsedValues.error.issues[0]?.message,
        { id: "otp-error" },
      );
      return;
    }

    try {
      if (currentPurpose === "password-reset") {
        const result = await verifyResetOtp(parsedValues.data);
        navigate("/reset-password", {
          state: {
            email: currentEmail,
            resetToken: result.resetToken,
            statusMessage: result.message || "OTP verified successfully.",
          },
        });
        return;
      }

      const result = await verifyOtp(parsedValues.data);
      const postLoginPath = getPostLoginPath(result?.user);

      // Registration OTP success should land on the role-appropriate home.
      if (currentPurpose === "register") {
        navigate(postLoginPath, {
          state: {
            statusMessage: "Login successful. Welcome!",
          },
          replace: true,
        });
        return;
      }

      if (result.isLoggedIn) {
        navigate(postLoginPath, {
          state: {
            statusMessage: result.message || "Login successful. Welcome!",
          },
          replace: true,
        });
      } else {
        navigate("/auth", {
          state: {
            activeTab: "login",
            statusMessage: result.message || "Account verified. You can now log in.",
          },
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(
          getFieldErrors(error).otp?.[0] || error.issues[0]?.message,
          { id: "otp-error" },
        );
        return;
      }

      toast.error(
        getApiErrorMessage(error, "OTP verification failed. Please try again."),
        { id: "otp-error" },
      );
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);

    if (!currentEmail) {
      toast.error("We could not find the email for this verification attempt.", { id: "otp-error" });
      return;
    }

    try {
      await resendOtp(currentEmail);
      setPendingVerification({
        email: currentEmail,
        purpose: currentPurpose || "register",
      });
      toast.success("A fresh 6-digit code has been sent. Please check your email.", { id: "otp-resent" });
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We could not resend the OTP. Please try again."),
        { id: "otp-error" },
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      {/* Animated background orbs */}
      <motion.div
        className="pointer-events-none absolute left-[-6rem] top-8 h-60 w-60 rounded-full bg-violet-300/25 blur-3xl"
        animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-[-7rem] top-32 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto grid w-full max-w-5xl items-stretch gap-5 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-[0_28px_80px_-38px_rgba(33,66,118,0.58)] backdrop-blur md:grid-cols-[1fr_1.15fr] md:p-4"
      >
        {/* Left: Decorative sidebar */}
        <aside className="relative hidden overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 p-8 text-slate-100 md:flex md:flex-col md:justify-between">
          <motion.div
            className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-white/20"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-slate-200"
            >
              Identity Verification
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-5 text-4xl font-semibold leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              One code away from your events.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300"
            >
              We sent a 6-digit verification code to your email. Enter it below to confirm your identity and continue.
            </motion.p>
          </div>

          {/* Security features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 space-y-3"
          >
            {[
              { icon: ShieldCheck, text: "End-to-end encrypted verification" },
              { icon: Fingerprint, text: "One-time codes that expire safely" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4 text-cyan-300" />
                </div>
                <span className="text-xs text-slate-300">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </aside>

        {/* Right: OTP form */}
        <section className="flex flex-col justify-center rounded-2xl border border-white/70 bg-white/90 p-7 shadow-sm sm:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
            className="mb-6 flex items-center justify-center gap-2.5 text-slate-700"
          >
            <LogoIcon />
            <span className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-serif)" }}>
              EventZen
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 text-center"
          >
            <h1 className="text-xl font-semibold text-slate-900">Verify OTP</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter the 6-digit code sent to your email.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email info badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                <ShieldCheck className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-sm text-slate-600">
                {currentEmail
                  ? <>Code sent to <span className="font-semibold text-slate-800">{currentEmail}</span></>
                  : "If you requested a new OTP, only the most recently sent code will work."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              <OtpDigitFields
                otp={otp}
                inputRefs={inputRefs}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
            >
              <Button
                type="submit"
                disabled={!isComplete || !currentEmail || isLoading}
                className="w-full"
              >
                <BadgeCheck className="size-4" />
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-slate-500"
          >
            Didn't receive the code?{""}
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-2 text-center text-sm text-slate-500"
          >
            <Link to="/auth" className="font-semibold text-slate-700 hover:underline">
              Back to login
            </Link>
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
