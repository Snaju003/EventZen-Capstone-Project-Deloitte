import { useEffect, useId, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { CalendarPopover } from "@/components/ui/custom-calendar/CalendarPopover";
import {
  formatDisplayDate,
  getDaysInMonth,
  getFirstDayOfWeek,
  parseDate,
  toDateString,
} from "@/components/ui/custom-calendar/calendar.utils";

export default function CustomCalendar({
  label,
  value = "",
  onChange,
  disabled = false,
  required = false,
  id: externalId,
}) {
  const internalId = useId();
  const controlId = externalId || internalId;
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate());

  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

  useEffect(() => {
    const parsedValue = parseDate(value);
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const goToPrevMonth = () => {
    setViewMonth((previous) => {
      if (previous === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return previous - 1;
    });
  };

  const goToNextMonth = () => {
    setViewMonth((previous) => {
      if (previous === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return previous + 1;
    });
  };

  const handleDayClick = (day) => {
    onChange?.(toDateString(viewYear, viewMonth, day));
    setIsOpen(false);
  };

  const handleGoToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const cells = [];
  for (let index = 0; index < firstDay; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return (
    <div ref={containerRef} className="relative">
      {label ? (
        <label htmlFor={controlId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required ? <span className="text-red-400">*</span> : null}
        </label>
      ) : null}

      <button
        id={controlId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-all ${
          isOpen
            ? "border-primary/50 ring-2 ring-primary/20"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? formatDisplayDate(value) : "Select a date"}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>

      {required ? (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          className="absolute bottom-0 left-0 h-0 w-0 opacity-0"
          aria-hidden="true"
        />
      ) : null}

      {isOpen ? (
        <CalendarPopover
          cells={cells}
          onDayClick={handleDayClick}
          onGoToToday={handleGoToToday}
          onNextMonth={goToNextMonth}
          onPrevMonth={goToPrevMonth}
          onSelectToday={() => {
            onChange?.(todayStr);
            setIsOpen(false);
          }}
          todayStr={todayStr}
          value={value}
          viewMonth={viewMonth}
          viewYear={viewYear}
        />
      ) : null}
    </div>
  );
}
