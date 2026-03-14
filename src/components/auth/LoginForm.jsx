import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, loginSchema } from "@/lib/auth-schemas";

export const LoginForm = () => {
  const { isLoading, isAuthenticated, login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");
    setSuccessMessage("");

    const values = { email, password };
    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    try {
      const result = await login(parsedValues.data);
      setSuccessMessage(result.message || "You are now logged in.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(getFieldErrors(error));
        return;
      }

      setSubmitError(getApiErrorMessage(error, "Login failed. Please try again."));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError ? (
        <Alert variant="destructive" className="mb-4 grid gap-1 rounded-xl">
          <AlertTitle>Login failed</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {successMessage || isAuthenticated ? (
        <Alert className="mb-4 grid gap-1 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
          <AlertTitle>Signed in</AlertTitle>
          <AlertDescription className="text-emerald-700">
            {successMessage || `Welcome back${user?.name ? `, ${user.name}` : ""}.`}
          </AlertDescription>
        </Alert>
      ) : null}

      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<MailIcon />}
        error={errors.email?.[0]}
        ariaDescribedBy="login-email-error"
        autoComplete="email"
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<LockIcon />}
        showToggle
        showPassword={showPassword}
        onToggle={() => setShowPassword((p) => !p)}
        error={errors.password?.[0]}
        ariaDescribedBy="login-password-error"
        autoComplete="current-password"
      />

      <div className="flex justify-end mb-4">
        <Link
          to="/forget-password"
          className="text-sm font-medium text-[#2e4057] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        <ArrowRight className="size-4" />
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
};
