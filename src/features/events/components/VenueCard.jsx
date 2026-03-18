import React from 'react';
import { Heart, MapPin, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '@/lib/currency';

export function VenueCard({ venue }) {
    const primaryImage =
        (Array.isArray(venue.imageUrls) && venue.imageUrls.find((url) => typeof url === "string" && url.trim())) ||
        venue.image ||
        null;

    return (
        <article className="group flex flex-col gap-3 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div className="absolute right-3 top-3 z-10">
                    <button
                        type="button"
                        aria-label={`Save ${venue.name}`}
                        className="flex size-8 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-700"
                    >
                        <Heart size={18} />
                    </button>
                </div>
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-lg font-semibold text-slate-500">
                        {venue.name}
                    </div>
                )}
                {venue.premium && (
                    <div className="absolute bottom-3 left-3">
                        <span className="rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Premium</span>
                    </div>
                )}
            </div>
            <div className="p-4 pt-1">
                <div className="mb-1 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-amber-700">
                        <Star size={14} className="fill-amber-600" />
                        <span className="text-sm font-bold">{venue.rating ?? '-'}</span>
                    </div>
                </div>
                <p className="mb-3 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    {venue.location}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Users size={16} />
                        <span className="text-xs font-medium">Up to {venue.capacity}</span>
                    </div>
                    <p className="text-base font-bold text-primary">
                        {formatINR(venue.price)}<span className="text-xs font-normal text-slate-500">/ticket</span>
                    </p>
                </div>
                <Link
                    to={`/events/${venue.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                    View details
                </Link>
            </div>
        </article>
    );
}
