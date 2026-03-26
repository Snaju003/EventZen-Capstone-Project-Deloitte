import { motion } from "framer-motion";

export function EventsPaginationBar({ onNext, onPrevious, pagination }) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="surface-card mt-6 flex items-center justify-between gap-3 px-4 py-3"
    >
      <p className="text-sm text-slate-600">
        Page {pagination.page} of {pagination.totalPages} • {pagination.total} events
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={pagination.page <= 1}
          className="action-secondary h-9 bg-slate-100 px-3 hover:bg-slate-200 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!pagination.hasNext}
          className="action-secondary h-9 bg-slate-100 px-3 hover:bg-slate-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
}
