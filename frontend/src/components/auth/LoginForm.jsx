import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getFieldErrors, loginSchema } from "@/lib/auth-schemas";
import toast from "react-hot-toast";

const fieldAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export const LoginForm = () => {
  const { isLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const values = { email, password };
    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      setErrors(getFieldErrors(parsedValues.error));
      return;
    }

    try {
      const result = await login(parsedValues.data);
      const welcomeName = result?.user?.name ? `, ${result.user.name}` : '';
      toast.success(result?.message || `Welcome back${welcomeName}!`, { id: "login-success" });
      // Navigation is handled by AuthPage's isAuthenticated guard — no
      // imperative navigate() here to avoid racing the auth state update.
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(getFieldErrors(error));
        return;
      }

      toast.error(getApiErrorMessage(error, "Login failed. Please try again."), { id: "login-error" });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
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
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
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
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-5 flex justify-end"
      >
        <Link
          to="/forget-password"
          className="group relative text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-primary"
        >
          Forgot password?
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>
      </motion.div>

      <motion.div
        {...fieldAnimation}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary via-blue-600 to-cyan-600 shadow-[0_4px_16px_-4px_rgba(59,130,246,0.4)] transition-all duration-300 hover:shadow-[0_6px_20px_-4px_rgba(59,130,246,0.5)]"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log in"}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      </motion.div>
    </form>
  );
};
