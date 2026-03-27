import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calender";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { BudgetReceiptIcon } from "@/pages/admin/components/budget/BudgetIcons";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseDateString(str) {
  if (!str) return undefined;
  const date = new Date(str + "T00:00:00");
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function SingleDatePicker({ label, id, value, onChange, disabled, required }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const selected = parseDateString(value);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (day) => {
    if (!day) return;
    onChange(toDateString(day));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required ? <span className="text-red-400">*</span> : null}
        </label>
      ) : null}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((c) => !c)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm transition-all ${
          open
            ? "border-primary/50 ring-2 ring-primary/20"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? formatDisplayDate(value) : "Select a date"}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
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
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              showOutsideDays
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function AddExpenseSection({
  categoryOptions,
  expenseForm,
  isAddingExpense,
  onExpenseFormChange,
  onSubmit,
}) {
  return (
    <section className="surface-card surface-card-hover relative z-10 mb-6 p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <BudgetReceiptIcon />
        <div>
          <h2 className="text-lg font-bold text-slate-900">Add Expense</h2>
          <p className="text-sm text-slate-500">Log a new expense against this event&apos;s budget.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="expense-description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Description <span className="text-red-400">*</span>
            </label>
            <input
              id="expense-description"
              value={expenseForm.description}
              onChange={(eventInput) => onExpenseFormChange({ description: eventInput.target.value })}
              placeholder="e.g. DJ Sound System Rental"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isAddingExpense}
              required
            />
          </div>

          <div>
            <label htmlFor="expense-amount" className="mb-1.5 block text-sm font-medium text-slate-700">
              Amount (INR) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">INR</span>
              <input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={expenseForm.amount}
                onChange={(eventInput) => onExpenseFormChange({ amount: eventInput.target.value })}
                placeholder="0.00"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-3 transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isAddingExpense}
                required
              />
            </div>
          </div>

          <div>
            <SingleDatePicker
              label="Date"
              id="expense-date"
              value={expenseForm.expenseDate}
              onChange={(dateStr) => onExpenseFormChange({ expenseDate: dateStr })}
              disabled={isAddingExpense}
              required
            />
          </div>

          <div>
            <CustomDropdown
              label="Category"
              id="expense-category"
              options={categoryOptions}
              value={expenseForm.category}
              onChange={(value) => onExpenseFormChange({ category: value })}
              disabled={isAddingExpense}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isAddingExpense}
          className="button-polish focus-polish h-11 w-full bg-primary px-4 text-white disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
        >
          {isAddingExpense ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </section>
  );
}
