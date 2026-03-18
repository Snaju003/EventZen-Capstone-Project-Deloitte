import React from 'react';
import { VenueCard } from '@/features/events/components/VenueCard';

export function VenueGrid({ venues }) {
    return (
        <div className="grid grid-cols-1 gap-6 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
            ))}
        </div>
    );
}
