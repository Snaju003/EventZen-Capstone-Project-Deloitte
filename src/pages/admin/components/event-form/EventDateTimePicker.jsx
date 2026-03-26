import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import {
  DAYS,
  MONTHS,
  TIME_SLOTS,
  daysInMonth,
  firstDayOfMonth,
  pad,
  parseLocalDatetime,
  toLocalDatetimeString,
} from "@/pages/admin/components/event-form/dateTimePicker.utils";

export function EventDateTimePicker({ label, hint, value, onChange, minValue, required }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const timeListRef = useRef(null);

  const parsed = parseLocalDatetime(value);
  const minParsed = parseLocalDatetime(minValue);
  const minDatetime = minParsed ? new Date(minParsed.getTime() + 60 * 60 * 1000) : null;

  const [view, setView] = useState(() => {
    const date = parsed || minParsed || new Date();
    return { year: date.getFullYear(), month: date.getMonth() };
  });

  useEffect(() => {
    if (!parsed && minParsed) {
      setView({ year: minParsed.getFullYear(), month: minParsed.getMonth() });
    }
  }, [parsed, minParsed]);

  useEffect(() => {
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !timeListRef.current) return;
    const selected = timeListRef.current.querySelector("[data-selected='true']");
    if (selected) selected.scrollIntoView({ block: "center" });
  }, [open]);

  const selectDay = (day) => {
    let hours = parsed ? parsed.getHours() : 9;
    let minutes = parsed ? parsed.getMinutes() : 0;

    if (minDatetime) {
      const minDay = new Date(minDatetime.getFullYear(), minDatetime.getMonth(), minDatetime.getDate());
      const cellDay = new Date(view.year, view.month, day);

      if (cellDay.getTime() === minDay.getTime()) {
        const slotMinutes = hours * 60 + minutes;
        const minMinutes = minDatetime.getHours() * 60 + minDatetime.getMinutes();
        if (slotMinutes < minMinutes) {
          const nextSlot = Math.ceil(minMinutes / 30) * 30;
          hours = Math.floor(nextSlot / 60) % 24;
          minutes = nextSlot % 60;
        }
      }
    }

    onChange(toLocalDatetimeString(new Date(view.year, view.month, day, hours, minutes)));
  };

  const selectTime = (slot) => {
    const baseDate = parsed || new Date(view.year, view.month, 1);
    const nextDate = new Date(baseDate);
    nextDate.setHours(slot.h);
    nextDate.setMinutes(slot.m);
    onChange(toLocalDatetimeString(nextDate));
    setOpen(false);
  };

  const totalDays = daysInMonth(view.year, view.month);
  const monthFirstDay = firstDayOfMonth(view.year, view.month);
  const cells = Array.from({ length: monthFirstDay + totalDays }, (_, index) => (index < monthFirstDay ? null : index - monthFirstDay + 1));
  const selectedTimeValue = parsed ? `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}` : null;
  const displayValue = parsed
    ? `${MONTHS[parsed.getMonth()].slice(0, 3)} ${pad(parsed.getDate())}, ${parsed.getFullYear()}  •  ${TIME_SLOTS.find((slot) => slot.value === selectedTimeValue)?.label ?? `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`}`
    : "";

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <Calendar className="h-3.5 w-3.5 text-primary/70" />
        {label}
        {required ? <span className="text-red-400">*</span> : null}
      </label>
      {hint ? <p className="text-[10px] text-slate-400">{hint}</p> : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span className={displayValue ? "font-medium text-slate-800" : "text-slate-400"}>{displayValue || "Pick date & time"}</span>
        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full z-50 mt-1 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            style={{ minWidth: "460px" }}
          >
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setView((current) => {
                  const date = new Date(current.year, current.month - 1);
                  return { year: date.getFullYear(), month: date.getMonth() };
                })} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
                <span className="text-sm font-bold text-slate-800">{MONTHS[view.month]} {view.year}</span>
                <button type="button" onClick={() => setView((current) => {
                  const date = new Date(current.year, current.month + 1);
                  return { year: date.getFullYear(), month: date.getMonth() };
                })} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
              </div>

              <div className="mb-1 grid grid-cols-7 text-center">
                {DAYS.map((day) => <span key={day} className="text-[10px] font-bold text-slate-400">{day}</span>)}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} />;

                  const cellDate = new Date(view.year, view.month, day);
                  const minimumDay = minDatetime ? new Date(minDatetime.getFullYear(), minDatetime.getMonth(), minDatetime.getDate()) : null;
                  const isDisabled = minimumDay && cellDate < minimumDay;
                  const isSelected = parsed && parsed.getDate() === day && parsed.getMonth() === view.month && parsed.getFullYear() === view.year;
                  const today = new Date();
                  const isToday = today.getDate() === day && today.getMonth() === view.month && today.getFullYear() === view.year;

                  const classes = isSelected
                    ? "bg-primary text-white shadow-sm"
                    : isDisabled
                      ? "cursor-not-allowed text-slate-300"
                      : isToday
                        ? "border border-primary/40 text-primary"
                        : "text-slate-700 hover:bg-slate-100";

                  return <button key={day} type="button" disabled={isDisabled} onClick={() => selectDay(day)} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${classes}`}>{day}</button>;
                })}
              </div>
            </div>

            <div className="w-px bg-slate-100" />

            <div className="flex flex-col" style={{ width: "130px" }}>
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Time</span>
              </div>
              <div ref={timeListRef} className="flex-1 overflow-y-auto py-1" style={{ maxHeight: "260px" }}>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeValue === slot.value;
                  const isSlotDisabled = (() => {
                    if (!minDatetime || !parsed) return false;
                    const selectedDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
                    const boundaryDay = new Date(minDatetime.getFullYear(), minDatetime.getMonth(), minDatetime.getDate());
                    if (selectedDay.getTime() !== boundaryDay.getTime()) return false;
                    return slot.h * 60 + slot.m < minDatetime.getHours() * 60 + minDatetime.getMinutes();
                  })();

                  const classes = isSlotDisabled
                    ? "cursor-not-allowed text-slate-300"
                    : isSelected
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-slate-700 hover:bg-slate-50";

                  return <button key={slot.value} type="button" disabled={isSlotDisabled} data-selected={isSelected ? "true" : "false"} onClick={() => selectTime(slot)} className={`flex w-full items-center px-3 py-2 text-sm transition-colors ${classes}`}>{slot.label}</button>;
                })}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
