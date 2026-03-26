import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function StepCard({ step, icon: Icon, title, description, cta, href, index }) {
  return (
    <motion.div
      className="relative flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: "0 24px 60px -24px rgba(15,23,42,0.2)" }}
    >
      <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </span>
      <p className="absolute right-5 top-5 select-none text-5xl font-black text-slate-100">{step}</p>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{description}</p>
      {cta && href ? (
        <Link to={href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </motion.div>
  );
}

export function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 16px 40px -16px rgba(15,23,42,0.15)" }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
      </div>
    </motion.div>
  );
}

export function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <p className="text-sm leading-relaxed text-slate-600">"{testimonial.text}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {testimonial.name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
          <p className="text-xs text-slate-400">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
