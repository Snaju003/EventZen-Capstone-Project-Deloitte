import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="footer-shell mt-16 py-10"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <Link to="/" className="flex items-center gap-2.5 text-slate-600 transition-colors hover:text-slate-900">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-white">
            <Ticket className="h-3 w-3" />
          </div>
          <span className="text-sm font-bold tracking-tight">EventZen</span>
        </Link>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <Link to="/events" className="transition-colors hover:text-slate-700">Events</Link>
          <Link to="/venues" className="transition-colors hover:text-slate-700">Venues</Link>
          <Link to="/auth" state={{ activeTab: "login" }} className="transition-colors hover:text-slate-700">Sign In</Link>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} EventZen. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
