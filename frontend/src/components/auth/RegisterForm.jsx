import { useState } from "react";
import { BadgePlus } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon, UserIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, registerSchema } from "@/lib/auth-schemas";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { isLoading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const values = { name, email, password, confirmPassword };
    const parsedValues = registerSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    try {
      const result = await register(parsedValues.data);
      navigate("/verify-otp", {
        state: {
          email: parsedValues.data.email,
          purpose: "register",
          statusMessage: result.message || "We sent a verification code to your email.",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(getFieldErrors(error));
        return;
      }

      toast.error(
        getApiErrorMessage(error, "Registration failed. Please try again."),
        { id: "register-error" },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <InputField
        label="Full name"
        type="text"
        placeholder="Enter your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        icon={<UserIcon />}
        error={errors.name?.[0]}
        ariaDescribedBy="register-name-error"
        autoComplete="name"
      />
      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<MailIcon />}
        error={errors.email?.[0]}
        ariaDescribedBy="register-email-error"
        autoComplete="email"
      />
      <InputField
        label="Password"
        type="password"
        placeholder="Create a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<LockIcon />}
        showToggle
        showPassword={showPassword}
        onToggle={() => setShowPassword((p) => !p)}
        requirements={passwordRequirements}
        error={errors.password?.[0]}
        ariaDescribedBy="register-password-error"
        autoComplete="new-password"
      />
      <InputField
        label="Re-enter password"
        type="password"
        placeholder="Confirm your password"
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
        className="mt-1 w-full"
        disabled={isLoading}
      >
        <BadgePlus className="size-4" />
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
