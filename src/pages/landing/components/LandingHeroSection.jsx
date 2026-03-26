import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { fadeUp, staggerContainer } from "@/lib/animations";
import { HERO_MOCK_CARDS } from "@/pages/landing/data/landingContent";

const smooth = { duration: 0.5, ease: "easeOut" };

export function LandingHeroSection() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-32 text-center sm:px-8 sm:pt-40">
      <motion.div initial="hidden" animate="show" variants={staggerContainer(0.08, 0)} className="flex flex-col items-center">
        <motion.span
          variants={fadeUp}
          transition={smooth}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          EventZen · Your Event Platform
        </motion.span>

        <motion.h1
          variants={fadeUp}
          transition={smooth}
          className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
        >
          Discover Events <span className="relative whitespace-nowrap text-primary">
            Made for You
            <motion.svg
              viewBox="0 0 300 12"
              className="absolute -bottom-1 left-0 w-full"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.1, delay: 0.7 } } }}
              aria-hidden
            >
              <motion.path
                d="M0 6 Q75 0 150 6 Q225 12 300 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ pathLength: 0 }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
              />
            </motion.svg>
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} transition={smooth} className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
          Browse and book concerts, workshops, conferences, and more — all in one
          beautifully simple platform.
        </motion.p>

        <motion.div variants={fadeUp} transition={smooth} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:scale-95"
          >
            Browse Events <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            state={{ activeTab: "register" }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
          >
            Create Account
          </Link>
        </motion.div>

        <motion.p variants={fadeUp} transition={smooth} className="mt-6 text-xs text-slate-400">
          No credit card required · Book in under 2 minutes · OTP-verified accounts
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
        className="mt-16 w-full max-w-2xl"
      >
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.25)]">
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="ml-3 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-left text-xs text-slate-400">
              eventzen.app/events
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 flex-1 rounded-xl bg-slate-100" />
              <div className="h-9 w-28 rounded-xl bg-slate-100" />
              <div className="h-9 w-24 rounded-xl bg-slate-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {HERO_MOCK_CARDS.map((card) => (
                <div key={card.title} className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <div className={`flex h-20 items-end bg-gradient-to-br p-3 ${card.color}`}>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">{card.date}</span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-bold text-slate-900">{card.title}</p>
                    <p className="truncate text-[10px] text-slate-400">{card.venue}</p>
                    <p className="mt-1.5 text-xs font-semibold text-primary">{card.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
