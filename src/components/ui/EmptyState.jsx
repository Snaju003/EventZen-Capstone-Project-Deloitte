import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "No items found.",
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="surface-card flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"
      >
        <Icon className="h-6 w-6" />
      </motion.div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}
