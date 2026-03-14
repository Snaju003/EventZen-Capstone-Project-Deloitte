import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InputField } from "@/components/ui/InputField";
import { LogoIcon, LockIcon } from "@/components/ui/Icons";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordMismatch || passwordRequirements.some((r) => !r.isMet)) return;
    // TODO: wire up reset password logic
    console.log("Reset Password:", { password });
    navigate("/success-message");
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
          <div className="flex items-center gap-2.5 text-[#2e4057] mb-6">
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
          {passwordMismatch ? (
            <Alert
              variant="destructive"
              className="mb-4 grid gap-1 rounded-xl"
            >
              <AlertTitle>Passwords do not match</AlertTitle>
              <AlertDescription>
                Please make sure both password fields are identical before continuing.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 grid gap-1 rounded-xl">
              <AlertTitle>Create a strong password</AlertTitle>
              <AlertDescription>
                Use the checklist below to choose a password that is harder to guess.
              </AlertDescription>
            </Alert>
          )}

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
            error={passwordMismatch ? "Passwords do not match." : ""}
            ariaDescribedBy="confirm-error"
          />

          <button
            type="submit"
            disabled={passwordMismatch || passwordRequirements.some((r) => !r.isMet) || !password}
            className="w-full h-11 rounded-[10px] bg-[#2e4057] text-white text-[0.9375rem] font-semibold hover:bg-[#253449] active:scale-[0.985] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e4057] mt-4"
          >
            Reset password
          </button>
        </form>

        {/* Footer link */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/" className="font-semibold text-[#2e4057] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
