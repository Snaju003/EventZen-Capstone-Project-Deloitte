import { motion } from "framer-motion";

import { cardEnter, staggerContainer } from "@/lib/animations";

export function VenuesGridSection({ isActive, isLoading, venues }) {
  return (
    <div className={isActive ? undefined : "hidden"}>
      {!isLoading ? (
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          variants={staggerContainer(0.06, 0)}
          initial="hidden"
          animate="show"
        >
          {venues.map((venue, index) => (
            <motion.article
              key={venue.id}
              className="surface-card surface-card-hover p-5"
              variants={cardEnter}
              custom={index}
              whileHover={{ y: -3 }}
            >
              <h2 className="text-lg font-bold text-slate-900">{venue.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{venue.address}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Capacity: {venue.capacity || 0}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{venue.description || "No venue description available."}</p>
            </motion.article>
          ))}
          {venues.length === 0 ? (
            <div className="surface-card p-6 text-center text-slate-600 md:col-span-2">No venues found.</div>
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
