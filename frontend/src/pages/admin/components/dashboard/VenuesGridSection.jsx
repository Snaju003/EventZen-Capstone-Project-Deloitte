import { useState } from "react";
import { motion } from "framer-motion";

import { ClampedDescription } from "@/components/common/ClampedDescription";
import { VenueDescriptionDialog } from "@/components/common/VenueDescriptionDialog";
import { cardEnter, staggerContainer } from "@/lib/animations";

export function VenuesGridSection({ isActive, isLoading, venues }) {
  const [activeVenueDescription, setActiveVenueDescription] = useState(null);

  return (
    <div className={isActive ? undefined : "hidden"}>
      {!isLoading ? (
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
              <div className="mt-3">
                <ClampedDescription
                  text={venue.description}
                  className="text-sm text-slate-600"
                  actionLabel="Show more"
                  onAction={() => setActiveVenueDescription(venue)}
                />
              </div>
            </motion.article>
          ))}
          {venues.length === 0 ? (
            <div className="surface-card p-6 text-center text-slate-600 md:col-span-2 lg:col-span-3 xl:col-span-4">No venues found.</div>
          ) : null}
        </motion.div>
      ) : null}

      <VenueDescriptionDialog
        isOpen={Boolean(activeVenueDescription)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveVenueDescription(null);
          }
        }}
        name={activeVenueDescription?.name}
        address={activeVenueDescription?.address}
        capacity={activeVenueDescription?.capacity}
        description={activeVenueDescription?.description}
      />
    </div>
  );
}
