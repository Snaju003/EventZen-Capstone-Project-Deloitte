import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/InputField";
import { LogoIcon, LockIcon } from "@/components/ui/Icons";
import { getFieldErrors, resetPasswordSchema } from "@/lib/auth-schemas";

const ResetPasswordPage = () => {
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [statusMessage] = useState(location.state?.statusMessage || "");

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
    setErrors({});

    const parsedValues = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    setSubmitError(
      "No password reset endpoint was provided in the available auth API, so this form is currently limited to client-side validation.",
    );
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
          {statusMessage ? (
            <Alert className="mb-4 grid gap-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
              <AlertTitle>OTP verified</AlertTitle>
              <AlertDescription className="text-emerald-700">
                {statusMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive" className="mb-4 grid gap-1 rounded-xl">
              <AlertTitle>Reset API not available</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

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
            disabled={passwordMismatch || passwordRequirements.some((r) => !r.isMet) || !password}
            className="mt-4 w-full"
          >
            <KeyRound className="size-4" />
            Reset password
          </Button>
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
