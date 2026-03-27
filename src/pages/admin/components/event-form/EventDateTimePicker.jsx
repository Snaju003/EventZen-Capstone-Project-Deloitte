import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { Calendar } from "@/components/ui/calender";
import {
  MONTHS,
  TIME_SLOTS,
  pad,
  parseLocalDatetime,
  toLocalDatetimeString,
} from "@/pages/admin/components/event-form/dateTimePicker.utils";

export function EventDateTimePicker({ label, hint, value, onChange, minValue, bookedDates = [], required }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const timeListRef = useRef(null);

  const parsed = parseLocalDatetime(value);
  const minParsed = parseLocalDatetime(minValue);
  const minDatetime = minParsed ? new Date(minParsed.getTime() + 60 * 60 * 1000) : null;
  const minDay = minDatetime ? new Date(minDatetime.getFullYear(), minDatetime.getMonth(), minDatetime.getDate()) : undefined;

  const [month, setMonth] = useState(() => {
    const date = parsed || minParsed || new Date();
    return new Date(date.getFullYear(), date.getMonth());
  });

  useEffect(() => {
    if (!parsed && minParsed) {
      setMonth(new Date(minParsed.getFullYear(), minParsed.getMonth()));
    }
  }, [value, minValue]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleDaySelect = (day) => {
    if (!day) return;

    let hours = parsed ? parsed.getHours() : 9;
    let minutes = parsed ? parsed.getMinutes() : 0;

    if (minDatetime) {
      const cellDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const boundaryDay = new Date(minDatetime.getFullYear(), minDatetime.getMonth(), minDatetime.getDate());

      if (cellDay.getTime() === boundaryDay.getTime()) {
        const slotMinutes = hours * 60 + minutes;
        const minMinutes = minDatetime.getHours() * 60 + minDatetime.getMinutes();
        if (slotMinutes < minMinutes) {
          const nextSlot = Math.ceil(minMinutes / 30) * 30;
          hours = Math.floor(nextSlot / 60) % 24;
          minutes = nextSlot % 60;
        }
      }
    }

    onChange(toLocalDatetimeString(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes)));
  };

  const selectTime = (slot) => {
    const baseDate = parsed || new Date(month.getFullYear(), month.getMonth(), 1);
    const nextDate = new Date(baseDate);
    nextDate.setHours(slot.h);
    nextDate.setMinutes(slot.m);
    onChange(toLocalDatetimeString(nextDate));
    setOpen(false);
  };

  const selectedTimeValue = parsed ? `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}` : null;
  const displayValue = parsed
    ? `${MONTHS[parsed.getMonth()].slice(0, 3)} ${pad(parsed.getDate())}, ${parsed.getFullYear()}  •  ${TIME_SLOTS.find((slot) => slot.value === selectedTimeValue)?.label ?? `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`}`
    : "";

  // Build booked dates modifiers for the calendar
  const bookedDays = bookedDates.map((d) => new Date(d));

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        <CalendarIcon className="h-3.5 w-3.5 text-primary/70" />
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
        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full z-50 mt-1 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="p-1">
              <Calendar
                mode="single"
                selected={parsed ?? undefined}
                onSelect={handleDaySelect}
                month={month}
                onMonthChange={setMonth}
                disabled={[
                  ...(minDay ? [{ before: minDay }] : []),
                  ...bookedDays,
                ]}
                modifiers={{ booked: bookedDays }}
                modifiersClassNames={{ booked: "rdp-booked" }}
                showOutsideDays
              />
            </div>

            <div className="w-px bg-slate-100" />

            <div className="flex flex-col" style={{ width: "130px" }}>
              <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Time</span>
              </div>
              <div ref={timeListRef} className="flex-1 overflow-y-auto py-1" style={{ maxHeight: "280px" }}>
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

      <style>{`
        .rdp-booked {
          position: relative;
        }
        .rdp-booked::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #ef4444;
        }
      `}</style>
    </div>
  );
}
