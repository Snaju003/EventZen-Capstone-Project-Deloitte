import { useState } from "react";
import { ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon, UserIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, registerSchema } from "@/lib/auth-schemas";

const fieldAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-amber-400" },
    { label: "Good", color: "bg-blue-400" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
};

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

  const passwordStrength = getPasswordStrength(password);

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
      {/* Personal info section */}
      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
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
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
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
      </motion.div>

      {/* Security section divider */}
      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="relative my-5"
      >
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-150" />
        </div>
        <div className="relative flex justify-center">
          <span className="flex items-center gap-1.5 bg-white/90 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <Shield className="size-3" />
            Security
          </span>
        </div>
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
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
      </motion.div>

      {/* Password strength bar */}
      {password.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="-mt-2 mb-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    level <= passwordStrength.score
                      ? passwordStrength.color
                      : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
            {passwordStrength.label && (
              <span className="text-[11px] font-semibold text-slate-500">
                {passwordStrength.label}
              </span>
            )}
          </div>
        </motion.div>
      )}

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
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
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          type="submit"
          className="mt-1 w-full bg-gradient-to-r from-primary via-blue-600 to-cyan-600 shadow-[0_4px_16px_-4px_rgba(59,130,246,0.4)] transition-all duration-300 hover:shadow-[0_6px_20px_-4px_rgba(59,130,246,0.5)]"
          disabled={isLoading}
        >
          <ArrowRight className="size-4" />
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </motion.div>

      <motion.p
        {...fieldAnimation}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="mt-4 text-center text-[11px] text-slate-400"
      >
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </motion.p>
    </form>
  );
};
