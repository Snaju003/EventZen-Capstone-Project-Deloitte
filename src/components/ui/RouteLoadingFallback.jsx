import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
        <div className="flex flex-col items-center gap-2">
          <div className="skeleton-pulse h-4 w-48 rounded-full" />
          <div className="skeleton-pulse h-3 w-32 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
