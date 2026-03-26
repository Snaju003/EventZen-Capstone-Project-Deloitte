import { motion } from "framer-motion";

export function SkeletonCard({ className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`surface-card overflow-hidden p-5 ${className}`}
    >
      <div className="skeleton-pulse mb-4 h-44 w-full rounded-xl" />
      <div className="skeleton-pulse mb-3 h-5 w-3/4" />
      <div className="skeleton-pulse mb-2 h-4 w-full" />
      <div className="skeleton-pulse mb-4 h-4 w-2/3" />
      <div className="flex items-center gap-3">
        <div className="skeleton-pulse h-4 w-24" />
        <div className="skeleton-pulse h-4 w-20" />
      </div>
    </motion.div>
  );
}

export function SkeletonCardGrid({ count = 4, columns = "md:grid-cols-2" }) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="surface-card p-4"
    >
      <div className="flex items-center gap-4">
        <div className="skeleton-pulse h-4 w-1/4" />
        <div className="skeleton-pulse h-4 w-1/6" />
        <div className="skeleton-pulse h-4 w-1/5" />
        <div className="skeleton-pulse h-4 w-1/6" />
      </div>
    </motion.div>
  );
}
