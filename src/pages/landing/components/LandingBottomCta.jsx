import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function LandingBottomCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-8 py-14 text-center text-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.5)]"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Ready?</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
          Your next favourite event is waiting
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-slate-300">
          Join EventZen today and get instant access to every upcoming event — no signup fees, no clutter.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            Browse Events <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            state={{ activeTab: "register" }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/20 active:scale-95"
          >
            Create Free Account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
