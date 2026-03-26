import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  DAY_LABELS,
  MONTH_NAMES,
  toDateString,
} from "@/components/ui/custom-calendar/calendar.utils";

export function CalendarPopover({
  cells,
  onDayClick,
  onGoToToday,
  onNextMonth,
  onPrevMonth,
  onSelectToday,
  todayStr,
  value,
  viewMonth,
  viewYear,
}) {
  return (
    <div
      className="absolute z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/8"
      style={{ animation: "calendarIn 0.18s ease-out" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onGoToToday}
          className="text-sm font-semibold text-slate-800 transition-colors hover:text-primary"
          title="Go to today"
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </button>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center">
        {DAY_LABELS.map((dayLabel) => (
          <span key={dayLabel} className="py-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {dayLabel}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} />;
          }

          const dateStr = toDateString(viewYear, viewMonth, day);
          const isSelected = dateStr === value;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onDayClick(day)}
              className={`flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? "bg-primary font-semibold text-white shadow-sm"
                  : isToday
                    ? "bg-primary/10 font-semibold text-primary hover:bg-primary/20"
                    : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={onSelectToday}
          className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          Today
        </button>
      </div>

      <style>{`
        @keyframes calendarIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
