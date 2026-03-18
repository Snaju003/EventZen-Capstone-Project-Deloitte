import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Users } from "lucide-react";

import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getApiErrorMessage } from "@/lib/auth-api";
import { getVenues } from "@/lib/events-api";

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
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [search, venues]);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Venues</h1>
            <p className="mt-1 text-slate-500">Explore available locations for your events.</p>
          </div>
          <label className="w-full md:w-80">
            <span className="sr-only">Search venues</span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or address"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-primary/20 transition-all focus:border-primary focus:ring-2"
            />
          </label>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-sm text-red-900">
            <p>{error}</p>
            <button type="button" onClick={loadVenues} className="mt-2 font-semibold underline">
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            Loading venues...
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            No venues matched your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <article key={venue.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <ImageCarousel images={venue.imageUrls} altPrefix={venue.name || "Venue"} className="mb-4 h-44" />
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" />
                  <h2 className="text-lg font-bold text-slate-900">{venue.name}</h2>
                </div>
                <p className="mb-4 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4" />
                  <span>{venue.address || "Address unavailable"}</span>
                </p>
                <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  <Users className="h-4 w-4" />
                  Capacity {venue.capacity || 0}
                </div>
                <p className="text-sm text-slate-600">{venue.description || "No venue description available."}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
