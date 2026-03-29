import { useEffect, useRef, useState } from "react";
import { BadgeCheck, RotateCcw } from "lucide-react";
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
 <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-slate-50">
 <div
 className="w-full max-w-md bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 animate-[fadeUp_0.38s_ease_both]"
 style={{ animation: "fadeUp 0.38s ease both" }}
 >
 <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

 <div className="flex flex-col items-center justify-center mb-8">
 <div className="flex items-center gap-2.5 text-slate-700 mb-6">
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
 <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
 {currentEmail
 ? `Enter the 6-digit code sent to ${currentEmail}.`
 : "If you requested a new OTP, only the most recently sent code will work."}
 </p>

  <OtpDigitFields otp={otp} inputRefs={inputRefs} onChange={handleChange} onKeyDown={handleKeyDown} />

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
 </div>

 <div className="mt-2 text-center text-sm text-slate-500">
 <Link to="/forget-password" className="font-semibold text-slate-700 hover:underline">
 Back
 </Link>
 </div>
 </div>
 </div>
 );
};

export default VerifyOtpPage;
