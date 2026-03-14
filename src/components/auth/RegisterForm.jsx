import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon, UserIcon } from "@/components/ui/Icons";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    // TODO: wire up registration logic
    console.log("Register:", { name, email, password });
    navigate("/verify-otp");
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
      />
      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<MailIcon />}
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
        error={passwordMismatch ? "Passwords do not match." : ""}
        ariaDescribedBy="confirm-error"
      />

      <button
        type="submit"
        className="w-full h-11 rounded-[10px] bg-[#2e4057] text-white text-[0.9375rem] font-semibold hover:bg-[#253449] active:scale-[0.985] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e4057] mt-1"
      >
        Create account
      </button>
    </form>
  );
};
