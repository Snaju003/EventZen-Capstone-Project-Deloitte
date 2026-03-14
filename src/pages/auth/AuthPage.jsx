import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LogoIcon } from "@/components/ui/Icons";

const AuthPage = () => {
  const [tab, setTab] = useState("login");

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-slate-50">
      <div
        key={tab}
        className="w-full max-w-md bg-white rounded-[20px] shadow-sm border border-slate-100 p-8 animate-[fadeUp_0.38s_ease_both]"
        style={{ animation: "fadeUp 0.38s ease both" }}
      >
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 text-[#2e4057] mb-6">
          <LogoIcon />
          <span className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Georgia', serif" }}>
            EventZen
          </span>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-slate-100 rounded-[10px] p-0.75 gap-0.75 mb-7">
          {["login", "register"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 h-8.5 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white text-[#2e4057] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>

        {/* Forms */}
        {tab === "login" ? <LoginForm /> : <RegisterForm />}

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("register")}
                className="font-semibold text-[#2e4057] hover:underline"
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setTab("login")}
                className="font-semibold text-[#2e4057] hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
