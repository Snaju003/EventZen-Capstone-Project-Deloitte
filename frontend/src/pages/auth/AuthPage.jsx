import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/ui/Icons";
import { useAuth } from "@/hooks/useAuth";
import { getRoleHomePath } from "@/lib/role-home";
import toast from "react-hot-toast";

const tabVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [tab, setTab] = useState(location.state?.activeTab || "login");

  const handleBackToHome = () => {
    navigate("/", { replace: true, state: null });
  };

  useEffect(() => {
    const activeTab = location.state?.activeTab;
    const statusMessage = location.state?.statusMessage;

    if (activeTab) {
      setTab(activeTab);
    }

    if (!statusMessage) return;

    toast.success(statusMessage, { id: "auth-status" });

    navigate(location.pathname, {
      replace: true,
      state: activeTab ? { activeTab } : null,
    });
  }, [location.pathname, location.state, navigate]);

  if (isAuthenticated) {
    const roleHomePath = getRoleHomePath(user?.role);
    const fromPath = typeof location.state?.from === "string" ? location.state.from : "";
    const shouldUseRoleHome = !fromPath
      || fromPath === "/"
      || fromPath === "/auth"
      || fromPath.startsWith("/auth?")
      || fromPath.startsWith("/auth#")
      || fromPath === "/profile";

    return <Navigate to={shouldUseRoleHome ? roleHomePath : fromPath} replace state={null} />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <motion.button
        type="button"
        onClick={handleBackToHome}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.96 }}
        className="group absolute left-4 top-4 z-50 flex items-center gap-2.5 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_4px_20px_-6px_rgba(33,66,118,0.18)] backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-linear-to-r hover:from-primary/10 hover:to-blue-50 hover:text-primary hover:shadow-[0_6px_24px_-6px_rgba(59,130,246,0.25)] sm:left-6 sm:top-6"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 transition-all duration-300 group-hover:bg-primary/15 group-hover:text-primary">
          <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
        </span>
        Back to Home
      </motion.button>
      <motion.div
        className="pointer-events-none absolute -left-24 top-8 h-60 w-60 rounded-full bg-sky-300/25 blur-3xl"
        animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-28 top-32 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl"
        animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto grid w-full max-w-5xl items-stretch gap-5 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-[0_28px_80px_-38px_rgba(33,66,118,0.58)] backdrop-blur md:grid-cols-[1fr_1.15fr] md:p-4"
      >
        <aside className="relative hidden overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-slate-100 md:block">
          <motion.div
            className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full border border-white/20"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.17em] text-slate-200"
          >
            Secure Access
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5 text-4xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Manage every event touchpoint from one control room.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300"
          >
            EventZen gives your team a single professional workspace for bookings, venues, budgets, and attendee operations.
          </motion.p>
        </aside>

        <section className="rounded-2xl border border-white/70 bg-white/90 p-7 shadow-sm sm:p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
            className="mb-6 flex items-center justify-center gap-2.5 text-slate-700"
          >
            <LogoIcon />
            <span className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-serif)" }}>
              EventZen
            </span>
          </motion.div>

          <div className="relative mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {["login", "register"].map((t) => (
              <Button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                variant="ghost"
                size="sm"
                className={`relative z-10 w-full ${tab === t
                  ? "text-slate-800 hover:bg-transparent"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {t === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
                {t === "login" ? "Log in" : "Register"}
                {tab === t ? (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                ) : null}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {tab === "login" ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm text-slate-500"
          >
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
          </motion.p>
        </section>
      </motion.div>
    </div>
  );
};

export default AuthPage;
