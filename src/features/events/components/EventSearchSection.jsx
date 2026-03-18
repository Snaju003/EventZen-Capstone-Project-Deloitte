import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export function EventSearchSection({ searchValue, onSearchChange, onAdvancedSearch }) {
    return (
        <div className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-3xl font-bold leading-tight text-slate-900">Find your perfect venue</h1>
                <p className="text-base text-slate-500">Browse through 200+ exclusive spaces for your next event.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                    <label className="relative flex w-full items-center">
                        <Search className="absolute left-4 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search venues by name, city, or style..."
                            className="h-12 w-full rounded-xl border-none bg-white pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary"
                        />
                    </label>
                </div>
                <button
                    type="button"
                    onClick={onAdvancedSearch}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-semibold text-white shadow-md transition-all hover:bg-primary/90"
                >
                    <SlidersHorizontal size={20} />
                    Advanced Search
                </button>
            </div>
        </div>
    );
}
