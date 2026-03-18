import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const FILTER_OPTIONS = [
    { key: 'all-types', label: 'All Types' },
    { key: 'capacity', label: 'Capacity', icon: ChevronDown },
    { key: 'price-range', label: 'Price Range', icon: ChevronDown },
    { key: 'amenities', label: 'Amenities', icon: ChevronDown },
    { key: 'availability', label: 'Availability', icon: Calendar },
];

function FilterChip({ label, active, icon: Icon, onClick }) {
    const baseClassName = 'flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5';

    if (active) {
        return (
            <button
                type="button"
                onClick={onClick}
                aria-pressed="true"
                className={`${baseClassName} bg-primary text-white shadow-sm`}
            >
                <span className="text-sm font-medium">{label}</span>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed="false"
            className={`${baseClassName} border border-slate-200 bg-white text-slate-700 transition-colors hover:border-primary`}
        >
            <span className="text-sm font-medium">{label}</span>
            {Icon ? <Icon size={16} /> : null}
        </button>
    );
}

export function EventFilters({ activeFilter, onFilterChange }) {
    return (
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-6">
            {FILTER_OPTIONS.map((filter) => (
                <FilterChip
                    key={filter.key}
                    label={filter.label}
                    active={activeFilter === filter.key}
                    icon={filter.icon}
                    onClick={() => onFilterChange(filter.key)}
                />
            ))}
        </div>
    );
}
