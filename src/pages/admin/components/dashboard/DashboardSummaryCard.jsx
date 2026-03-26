import { motion } from "framer-motion";

import AnimatedCounter from "@/components/common/AnimatedCounter";

export function DashboardSummaryCard({ title, value, helper, delay = 0 }) {
  return (
    <motion.div
      className="surface-card surface-card-hover p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 16px 40px -16px rgba(31,42,54,0.3)" }}
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        <AnimatedCounter end={value} duration={1} delay={delay + 0.2} />
      </p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </motion.div>
  );
}
