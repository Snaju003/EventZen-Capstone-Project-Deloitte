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
        <Link to="/" className="text-slate-700">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }} transition={{ type: "spring", stiffness: 320, damping: 22 }} className="flex items-center gap-3">
            <motion.div
              className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-blue-600 to-cyan-600 text-white shadow-md"
              whileHover={{ rotate: -4, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <Ticket className="h-4 w-4" />
            </motion.div>
            <div>
              <p className="text-base font-bold leading-tight tracking-tight text-slate-900">EventZen</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Event Operations Suite</p>
            </div>
          </motion.div>
        </Link>

        <motion.p
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
          className="text-xs text-slate-400"
        >
          © {new Date().getFullYear()} EventZen. All rights reserved.
        </motion.p>
      </div>
    </motion.footer>
  );
}
