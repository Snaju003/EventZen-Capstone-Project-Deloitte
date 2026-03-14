import { useState } from "react";
import { MailCheck } from "lucide-react";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitError("");

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

      setSubmitError(
        getApiErrorMessage(apiError, "We could not send the OTP. Please try again."),
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
            Forgot password
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Enter your email and we will send a one-time password.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {submitError ? (
            <Alert variant="destructive" className="mb-4 grid gap-1 rounded-xl">
              <AlertTitle>Unable to send OTP</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          <Alert className="mb-4 grid gap-1 rounded-xl">
            <AlertTitle>Check your inbox carefully</AlertTitle>
            <AlertDescription>
              We will send your one-time password to the email address you enter below.
            </AlertDescription>
          </Alert>

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
          Remember your password?{" "}
          <Link to="/" className="font-semibold text-[#2e4057] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
