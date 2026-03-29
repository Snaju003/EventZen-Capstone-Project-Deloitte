import { motion } from "framer-motion";
import { ArrowLeft, Ghost } from "lucide-react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { fadeUp, staggerContainer } from "@/lib/animations";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-28 h-48 w-48 bg-rose-200/25" />
      <div className="soft-orb right-[-3rem] top-44 h-40 w-40 bg-violet-200/20" style={{ animationDelay: "1.2s" }} />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* Animated 404 badge */}
          <motion.div
            variants={fadeUp}
            className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg"
          >
            <Ghost className="h-14 w-14 text-slate-400" strokeWidth={1.5} />
          </motion.div>

          {/* Giant 404 text */}
          <motion.h1
            variants={fadeUp}
            className="text-8xl font-bold tracking-tight text-slate-900 sm:text-9xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            404
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-3 text-xl font-semibold text-slate-700"
          >
            Page not found
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-2 max-w-md text-sm leading-relaxed text-slate-500"
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
            >
              Browse Events
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
