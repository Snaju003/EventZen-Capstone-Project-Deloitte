import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { SkeletonCardGrid } from "@/components/ui/SkeletonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/layout/Footer";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getVenues } from "@/lib/events-api";
import { staggerContainer, cardEnter } from "@/lib/animations";

export default function Venues() {
    const [venues, setVenues] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadVenues = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await getVenues();
            setVenues(data);
        } catch (loadError) {
            setError(getApiErrorMessage(loadError, "Failed to load venues."));
            setVenues([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVenues();
    }, [loadVenues]);

    const filteredVenues = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) {
            return venues;
        }

        return venues.filter((venue) => {
            return [venue.name, venue.address, venue.description]
                .filter(Boolean)
                .join("")
                .toLowerCase()
                .includes(needle);
        });
    }, [search, venues]);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
            <div className="soft-orb left-[-5rem] top-24 h-44 w-44 bg-cyan-200/30" />
            <div className="soft-orb right-[-4rem] top-48 h-40 w-40 bg-sky-300/20" style={{ animationDelay: '1.1s' }} />
            <main className="page-shell flex flex-1 flex-col">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-7 text-slate-100 shadow-[0_24px_64px_-34px_rgba(15,23,42,0.6)] sm:px-8"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Venue Intelligence</p>
                    <h1 className="mt-2 text-4xl font-semibold leading-tight" style={{ fontFamily: "var(--font-serif)" }}>Venues</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">Explore spaces, compare capacity and context, then shortlist your ideal event locations.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
                    className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
                >
                    <div>
                        <p className="text-sm font-medium text-slate-600">Refine your shortlist</p>
                    </div>
                    <label className="w-full md:w-80">
                        <span className="sr-only">Search venues</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or address"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white/95 px-3 text-sm outline-none ring-primary/20 shadow-sm transition-all focus:border-primary focus:ring-2"
                        />
                    </label>
                </motion.div>

                {error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 rounded-xl border border-red-300/70 bg-red-100/90 p-4 text-sm text-red-900 shadow-sm"
                    >
                        <p>{error}</p>
                        <button type="button" onClick={loadVenues} className="focus-polish mt-2 text-sm font-semibold underline">
                            Try again
                        </button>
                    </motion.div>
                ) : null}

                {isLoading ? (
                    <SkeletonCardGrid count={6} columns="sm:grid-cols-2 lg:grid-cols-3" />
                ) : filteredVenues.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No venues found"
                        description="No venues matched your search. Try a different keyword."
                    />
                ) : (
                    <motion.div
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        variants={staggerContainer(0.06, 0)}
                        initial="hidden"
                        animate="show"
                    >
                        {filteredVenues.map((venue, index) => (
                            <motion.article
                                key={venue.id}
                                className="surface-card overflow-hidden p-5"
                                variants={cardEnter}
                                custom={index}
                                whileHover={{ y: -4, boxShadow: "0 26px 60px -38px rgba(14,116,144,0.55)" }}
                                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                            >
                                <ImageCarousel images={venue.imageUrls} altPrefix={venue.name || "Venue"} className="mb-4 h-44" />
                                <div className="mb-3 flex items-center gap-2 text-primary">
                                    <Building2 className="h-5 w-5" />
                                    <h2 className="text-lg font-bold text-slate-900">{venue.name}</h2>
                                </div>
                                <p className="mb-4 flex items-start gap-2 text-sm text-slate-600">
                                    <MapPin className="mt-0.5 h-4 w-4" />
                                    <span>{venue.address || "Address unavailable"}</span>
                                </p>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                    <Users className="h-4 w-4" />
                                    Capacity {venue.capacity || 0}
                                </div>
                                <p className="text-sm text-slate-600">{venue.description || "No venue description available."}</p>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </main>
            <Footer />
        </div>
    );
}
