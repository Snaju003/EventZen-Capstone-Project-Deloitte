import { useState } from "react";
import { MailCheck } from "lucide-react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/InputField";
import { LogoIcon, MailIcon } from "@/components/ui/Icons";
import { getApiErrorMessage } from "@/lib/auth-api";
import { emailSchema } from "@/lib/auth-schemas";

const ForgetPasswordPage = () => {
 const navigate = useNavigate();
 const { isLoading, requestPasswordOtp } = useAuth();
 const [email, setEmail] = useState("");
 const [error, setError] = useState("");

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 const parsedEmail = emailSchema.safeParse(email);
 if (!parsedEmail.success) {
 setError(parsedEmail.error.issues[0]?.message || "Enter a valid email address.");
 return;
 }

 try {
 const result = await requestPasswordOtp(parsedEmail.data);
 navigate("/verify-otp", {
 state: {
 email: parsedEmail.data,
 purpose: "password-reset",
 statusMessage: result.message || "We sent a verification code to your email.",
 },
 });
 } catch (apiError) {
 if (apiError instanceof z.ZodError) {
 setError(apiError.issues[0]?.message || "Enter a valid email address.");
 return;
 }

 toast.error(
 getApiErrorMessage(apiError, "We could not send the OTP. Please try again."),
 { id: "forget-password-error" },
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
 Forgot password
 </h1>
 <p className="text-slate-500 text-sm mt-2 text-center">
 Enter your email and we will send a one-time password.
 </p>
 </div>

 <form onSubmit={handleSubmit} noValidate>
 <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
 We will send your one-time password to the email address you enter below.
 </p>

 <InputField
 label="Email"
 type="email"
 placeholder="name@company.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 icon={<MailIcon />}
 error={error}
 ariaDescribedBy="forgot-password-email-error"
 autoComplete="email"
 />

 <Button
 type="submit"
 className="mt-1 w-full"
 disabled={isLoading}
 >
 <MailCheck className="size-4" />
 {isLoading ? "Sending OTP..." : "Send OTP"}
 </Button>
 </form>

 <div className="mt-6 text-center text-sm text-slate-500">
 Remember your password?{""}
 <Link to="/auth" className="font-semibold text-slate-700 hover:underline">
 Log in
 </Link>
 </div>
 </div>
 </div>
 );
};

export default ForgetPasswordPage;
