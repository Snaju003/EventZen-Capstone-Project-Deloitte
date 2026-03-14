import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InputField } from "@/components/ui/InputField";
import { LogoIcon, MailIcon } from "@/components/ui/Icons";

const ForgetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    navigate("/verify-otp");
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
          />

          <button
            type="submit"
            className="w-full h-11 rounded-[10px] bg-[#2e4057] text-white text-[0.9375rem] font-semibold hover:bg-[#253449] active:scale-[0.985] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2e4057] mt-1"
          >
            Send OTP
          </button>
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
