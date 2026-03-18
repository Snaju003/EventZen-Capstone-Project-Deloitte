import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState(location.state?.activeTab || "login");

  useEffect(() => {
    const activeTab = location.state?.activeTab;
    const statusMessage = location.state?.statusMessage;

    if (activeTab) {
      setTab(activeTab);
    }

    if (!statusMessage) return;

    toast.success(statusMessage, { id: "auth-status" });

    // Consume one-time navigation message so it does not replay on refresh.
    navigate(location.pathname, {
      replace: true,
      state: activeTab ? { activeTab } : null,
    });
  }, [location.pathname, location.state, navigate]);

  if (isAuthenticated) {
    const normalizedRole = user?.role?.toLowerCase();
    const redirectPath = normalizedRole === "admin" || normalizedRole === "vendor" ? "/admin/dashboard" : "/profile";
    return <Navigate to={redirectPath} replace />;
  }

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
            <Button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              variant={tab === t ? "outline" : "ghost"}
              size="sm"
              className={`flex-1 ${tab === t
                ? "border-white bg-white text-[#2e4057] shadow-sm hover:bg-white"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
              {t === "login" ? "Log in" : "Register"}
            </Button>
          ))}
        </div>

        {/* Forms */}
        {tab === "login" ? <LoginForm /> : <RegisterForm />}

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          {tab === "login" ? (
            <>
              Don't have an account?{" "}
              <Button
                type="button"
                onClick={() => setTab("register")}
                variant="link"
                size="sm"
                className="h-auto p-0 font-semibold"
              >
                Register here
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button
                type="button"
                onClick={() => setTab("login")}
                variant="link"
                size="sm"
                className="h-auto p-0 font-semibold"
              >
                Log in
              </Button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
