import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/InputField";
import { LogoIcon, LockIcon } from "@/components/ui/Icons";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, resetPasswordSchema } from "@/lib/auth-schemas";

const ResetPasswordPage = () => {
 const location = useLocation();
 const navigate = useNavigate();
 const { isLoading, resetPassword, pendingResetToken } = useAuth();
 const resetToken = pendingResetToken || location.state?.resetToken;
 const statusMessage = location.state?.statusMessage;
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [errors, setErrors] = useState({});

 const passwordMismatch =
 confirmPassword.length > 0 && password !== confirmPassword;

 const passwordRequirements = [
 { label: "Minimum 8 characters long", isMet: password.length >= 8 },
 {
 label: "At least one uppercase and one lowercase letter",
 isMet: /[a-z]/.test(password) && /[A-Z]/.test(password),
 },
 {
 label: "At least one number or special character",
 isMet: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password),
 },
 ];

 useEffect(() => {
 if (statusMessage) {
 toast.success(statusMessage, { id: "reset-status" });
 }
 }, [statusMessage]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setErrors({});

 const parsedValues = resetPasswordSchema.safeParse({
 password,
 confirmPassword,
 });

 if (!parsedValues.success) {
 setErrors(getFieldErrors(parsedValues.error));
 return;
 }

 if (!resetToken) {
 toast.error("Missing reset token. Please restart the password reset flow.", { id: "reset-error" });
 return;
 }

 try {
 await resetPassword(parsedValues.data.password, resetToken);
 navigate("/success-message");
 } catch (apiError) {
 toast.error(
 getApiErrorMessage(apiError, "Password reset failed. Please try again."),
 { id: "reset-error" },
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

 {/* Brand & Header */}
 <div className="flex flex-col items-center justify-center mb-8">
 <div className="flex items-center gap-2.5 text-slate-700 mb-6">
 <LogoIcon />
 <span className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Georgia', serif" }}>
 EventZen
 </span>
 </div>
 <h1 className="text-xl font-semibold text-slate-900 text-center">
 Reset your password
 </h1>
 <p className="text-slate-500 text-sm mt-2 text-center">
 Please enter your new password below.
 </p>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} noValidate>
 <p className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
 {passwordMismatch
 ? "Please make sure both password fields are identical before continuing."
 : "Use the checklist below to choose a password that is harder to guess."}
 </p>

 <InputField
 label="New password"
 type="password"
 placeholder="Create a new password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 icon={<LockIcon />}
 showToggle
 showPassword={showPassword}
 onToggle={() => setShowPassword((p) => !p)}
 requirements={passwordRequirements}
 error={errors.password?.[0]}
 ariaDescribedBy="reset-password-error"
 autoComplete="new-password"
 />
 <InputField
 label="Confirm new password"
 type="password"
 placeholder="Confirm your new password"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 icon={<LockIcon />}
 showToggle
 showPassword={showConfirm}
 onToggle={() => setShowConfirm((p) => !p)}
 error={errors.confirmPassword?.[0] || (passwordMismatch ? "Passwords do not match." : "")}
 ariaDescribedBy="confirm-error"
 autoComplete="new-password"
 />

 <Button
 type="submit"
 disabled={passwordMismatch || passwordRequirements.some((r) => !r.isMet) || !password || isLoading}
 className="mt-4 w-full"
 >
 <KeyRound className="size-4" />
 {isLoading ? "Resetting password..." : "Reset password"}
 </Button>
 </form>

 {/* Footer link */}
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

export default ResetPasswordPage;
