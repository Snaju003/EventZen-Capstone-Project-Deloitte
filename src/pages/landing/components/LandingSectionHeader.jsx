import { motion } from "framer-motion";

export function LandingSectionHeader({ eyebrow, title }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mb-10 text-center"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl" style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}>
        {title}
      </h2>
    </motion.div>
  );
}
