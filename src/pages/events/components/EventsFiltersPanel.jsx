import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatShortDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateString(str) {
  if (!str) return undefined;
  const date = new Date(str + "T00:00:00");
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function DateRangeCalendarPicker({ startDate, endDate, onStartChange, onEndChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const from = parseDateString(startDate);
  const to = parseDateString(endDate);
  const range = from || to ? { from, to } : undefined;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRangeSelect = (newRange) => {
    onStartChange(newRange?.from ? toDateString(newRange.from) : "");
    onEndChange(newRange?.to ? toDateString(newRange.to) : "");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onStartChange("");
    onEndChange("");
  };

  const hasRange = startDate || endDate;
  const displayText = from && to
    ? `${formatShortDate(from)} – ${formatShortDate(to)}`
    : from
      ? `From ${formatShortDate(from)}`
      : to
        ? `Until ${formatShortDate(to)}`
        : "Select dates";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((c) => !c)}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white/95 px-3 text-sm shadow-sm transition-all ${open ? "border-primary ring-2 ring-primary/20" : "border-slate-200/80 hover:border-slate-300"}`}
      >
        <span className={hasRange ? "font-medium text-slate-800" : "text-slate-400"}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {hasRange ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </div>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-full z-50 mt-1 rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              showOutsideDays
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function EventsFiltersPanel({ filters, onFilterChange, onResetFilters, venues }) {
  const hasAnyFilter = Boolean(filters.search || filters.venueId || filters.startDate || filters.endDate || (filters.sortDir && filters.sortDir !== "asc"));
  const venueOptions = [
    { value: "", label: "All venues" },
    ...venues.map((venue) => ({ value: venue.id, label: venue.name })),
  ];

  const sortOptions = [
    { value: "asc", label: "Date: Earliest first" },
    { value: "desc", label: "Date: Latest first" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="surface-card relative z-30 mb-6 grid grid-cols-1 items-center gap-3 overflow-visible p-4 md:grid-cols-4"
    >
      <div>
        <label htmlFor="events-search" className="sr-only">Search events</label>
        <input
          id="events-search"
          value={filters.search}
          onChange={(event) => onFilterChange("search", event.target.value)}
          placeholder="Search events"
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/95 px-3 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <Select
          value={filters.venueId}
          onValueChange={(value) => onFilterChange("venueId", value)}
        >
          <SelectTrigger className="!h-11 w-full rounded-xl border-slate-200/80 bg-white/95 shadow-sm">
            <SelectValue placeholder="All venues" />
          </SelectTrigger>
          <SelectContent>
            {venueOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value || "__all__"}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <DateRangeCalendarPicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartChange={(value) => onFilterChange("startDate", value)}
          onEndChange={(value) => onFilterChange("endDate", value)}
        />
      </div>

      <div>
        <Select
          value={filters.sortDir || "asc"}
          onValueChange={(value) => onFilterChange("sortDir", value)}
        >
          <SelectTrigger className="!h-11 w-full rounded-xl border-slate-200/80 bg-white/95 shadow-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasAnyFilter ? (
        <motion.button
          type="button"
          onClick={onResetFilters}
          className="action-secondary h-11 bg-slate-100 hover:bg-slate-200 md:col-span-4"
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
        >
          Clear filters
        </motion.button>
      ) : null}
    </motion.section>
  );
}
