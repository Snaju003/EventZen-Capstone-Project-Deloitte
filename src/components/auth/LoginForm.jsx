import { useState } from "react";
import { Link } from "react-router-dom";
import { InputField } from "@/components/ui/InputField";
import { MailIcon, LockIcon } from "@/components/ui/Icons";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire up login logic
    console.log("Login:", { email, password });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
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
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<LockIcon />}
        showToggle
        showPassword={showPassword}
        onToggle={() => setShowPassword((p) => !p)}
      />

      <div className="flex justify-end mb-4">
        <Link
          to="/forget-password"
          className="text-sm font-medium text-[#2e4057] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full h-11 rounded-[10px] bg-[#2e4057] text-white text-[0.9375rem] font-semibold hover:bg-[#253449] active:scale-[0.985] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e4057]"
      >
        Log in
      </button>
    </form>
  );
};
