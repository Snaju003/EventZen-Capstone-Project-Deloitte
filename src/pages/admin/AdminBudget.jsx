import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import { formatINR } from "@/lib/currency";
import {
  addExpense,
  deleteExpense,
  getBudgetExpenses,
  getBudgetSummary,
  updateBudget,
} from "@/lib/budget-api";
import { getEventById } from "@/lib/events-api";

const categories = ["Venue", "Catering", "AV", "Marketing", "Staffing", "Miscellaneous"];
const chartPalette = ["#0f766e", "#1d4ed8", "#16a34a", "#dc2626", "#7c3aed", "#f97316"];

function toCurrencyNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercent(value, total) {
  if (total <= 0) return 0;
  return (value / total) * 100;
}

function buildConicGradient(segments, total) {
  if (!segments.length || total <= 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }

  let currentPercent = 0;
  const stops = segments.map((segment) => {
    const segmentPercent = toPercent(segment.value, total);
    const start = currentPercent;
    const end = Math.min(100, currentPercent + segmentPercent);
    currentPercent = end;
    return `${segment.color} ${start}% ${end}%`;
  });

  if (currentPercent < 100) {
    stops.push(`#e2e8f0 ${currentPercent}% 100%`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}

function getVendorLabel(assignment, index) {
  return (
    assignment?.vendorName
    || assignment?.name
    || assignment?.vendor?.name
    || assignment?.vendorId
    || `Vendor ${index + 1}`
  );
}

export default function AdminBudget() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [totalBudgetInput, setTotalBudgetInput] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    expenseDate: "",
    category: categories[0],
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setIsLoading(true);

    try {
      const [eventData, summaryData, expensesData] = await Promise.all([
        getEventById(eventId),
        getBudgetSummary(eventId),
        getBudgetExpenses(eventId),
      ]);

      setEvent(eventData);
      setSummary(summaryData);
      setExpenses(expensesData.expenses || []);
      setGrouped(expensesData.groupedByCategory || {});
      setTotalBudgetInput(String(summaryData?.totalBudget ?? ""));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load budget data."));
      setEvent(null);
      setSummary(null);
      setExpenses([]);
      setGrouped({});
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitBudget = async (submitEvent) => {
    submitEvent.preventDefault();
    try {
      await updateBudget(eventId, Number(totalBudgetInput));
      toast.success("Budget updated.");
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update budget."));
    }
  };

  const submitExpense = async (submitEvent) => {
    submitEvent.preventDefault();
    try {
      await addExpense(eventId, {
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        category: expenseForm.category,
      });
      toast.success("Expense added.");
      setExpenseForm({ description: "", amount: "", expenseDate: "", category: categories[0] });
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add expense."));
    }
  };

  const totals = useMemo(() => {
    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount: toCurrencyNumber(amount) }))
      .sort((a, b) => b.amount - a.amount);
  }, [grouped]);

  const vendorAssignments = useMemo(() => {
    return Array.isArray(event?.vendors) ? event.vendors : [];
  }, [event]);

  const vendorCommitted = useMemo(() => {
    return vendorAssignments.reduce((total, assignment) => total + toCurrencyNumber(assignment?.agreedCost), 0);
  }, [vendorAssignments]);

  const spentFromExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + toCurrencyNumber(expense?.amount), 0);
  }, [expenses]);

  const totalBudget = toCurrencyNumber(summary?.totalBudget);
  const committedSpend = vendorCommitted + spentFromExpenses;
  const remaining = totalBudget - committedSpend;
  const remainingPositive = Math.max(0, remaining);
  const overBudgetAmount = Math.max(0, -remaining);
  const isOverBudget = remaining < 0;
  const allocationDenominator = Math.max(totalBudget, committedSpend, 1);
  const utilizationPercent = totalBudget > 0 ? Math.round((committedSpend / totalBudget) * 100) : 0;

  const allocationSegments = useMemo(() => {
    return [
      { label: "Vendor Agreed Cost", value: vendorCommitted, color: chartPalette[0] },
      { label: "Logged Expenses", value: spentFromExpenses, color: chartPalette[1] },
      { label: "Remaining Budget", value: remainingPositive, color: chartPalette[2] },
      ...(overBudgetAmount > 0 ? [{ label: "Over Budget", value: overBudgetAmount, color: chartPalette[3] }] : []),
    ].filter((segment) => segment.value > 0);
  }, [overBudgetAmount, remainingPositive, spentFromExpenses, vendorCommitted]);

  const allocationGradient = useMemo(() => {
    return buildConicGradient(allocationSegments, allocationDenominator);
  }, [allocationDenominator, allocationSegments]);

  const maxCategoryAmount = useMemo(() => {
    if (!totals.length) return 1;
    return Math.max(...totals.map((item) => item.amount), 1);
  }, [totals]);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Budget Tracker</h1>
          <p className="mt-1 text-slate-500">{event?.title || "Event"}</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">Loading budget...</div>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Total Budget</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(totalBudget)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Vendor Agreed Cost</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(vendorCommitted)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Logged Expenses</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(spentFromExpenses)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Remaining</p>
                <p className={`mt-2 text-2xl font-bold ${isOverBudget ? "text-red-900" : "text-slate-900"}`}>{formatINR(remaining)}</p>
              </div>
              <div className={`rounded-xl border p-4 md:col-span-4 ${isOverBudget ? "border-red-300 bg-red-100" : "border-emerald-200 bg-emerald-50"}`}>
                <p className="text-sm text-slate-500">Status</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{isOverBudget ? `Over Budget by ${formatINR(overBudgetAmount)}` : "On Track"}</p>
                <p className="mt-1 text-sm text-slate-600">Remaining budget now subtracts both assigned vendor agreed costs and logged expenses.</p>
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold text-slate-900">Budget Allocation Pie Chart</h2>
                <p className="mt-1 text-sm text-slate-500">Visual split of vendor commitments, expenses, and remaining budget.</p>
                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="relative h-52 w-52 shrink-0 rounded-full border border-slate-200" style={{ background: allocationGradient }}>
                    <div className="absolute inset-10 flex items-center justify-center rounded-full bg-white text-center">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Utilized</p>
                        <p className="text-xl font-bold text-slate-900">{utilizationPercent}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    {allocationSegments.map((segment) => (
                      <div key={segment.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                          {segment.label}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatINR(segment.value)} ({toPercent(segment.value, allocationDenominator).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                    {allocationSegments.length === 0 ? <p className="text-sm text-slate-500">No budget values available to visualize.</p> : null}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold text-slate-900">Category Spend Graph</h2>
                <p className="mt-1 text-sm text-slate-500">Bar graph of logged expenses by category.</p>
                <div className="mt-5 space-y-3">
                  {totals.map((item, index) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{item.category}</span>
                        <span className="font-semibold text-slate-900">{formatINR(item.amount)}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: item.amount > 0 ? `${Math.max(6, (item.amount / maxCategoryAmount) * 100)}%` : "0%",
                            backgroundColor: chartPalette[index % chartPalette.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {totals.length === 0 ? <p className="text-sm text-slate-500">No expense totals yet.</p> : null}
                </div>
              </div>
            </section>

            <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Set Total Budget</h2>
              <form onSubmit={submitBudget} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalBudgetInput}
                  onChange={(eventInput) => setTotalBudgetInput(eventInput.target.value)}
                  className="h-11 flex-1 rounded-lg border border-slate-200 px-3"
                  required
                />
                <button type="submit" className="h-11 rounded-lg bg-primary px-4 font-semibold text-white">Save Budget</button>
              </form>
            </section>

            <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Add Expense</h2>
              <form onSubmit={submitExpense} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <input
                  value={expenseForm.description}
                  onChange={(eventInput) => setExpenseForm((previous) => ({ ...previous, description: eventInput.target.value }))}
                  placeholder="Description"
                  className="h-11 rounded-lg border border-slate-200 px-3 md:col-span-2"
                  required
                />
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(eventInput) => setExpenseForm((previous) => ({ ...previous, amount: eventInput.target.value }))}
                  placeholder="Amount"
                  className="h-11 rounded-lg border border-slate-200 px-3"
                  required
                />
                <input
                  type="date"
                  value={expenseForm.expenseDate}
                  onChange={(eventInput) => setExpenseForm((previous) => ({ ...previous, expenseDate: eventInput.target.value }))}
                  className="h-11 rounded-lg border border-slate-200 px-3"
                />
                <select
                  value={expenseForm.category}
                  onChange={(eventInput) => setExpenseForm((previous) => ({ ...previous, category: eventInput.target.value }))}
                  className="h-11 rounded-lg border border-slate-200 px-3"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button type="submit" className="h-11 rounded-lg bg-primary px-4 font-semibold text-white md:col-span-3">Add Expense</button>
              </form>
            </section>

            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">Assigned Vendors</h2>
                {vendorAssignments.length === 0 ? (
                  <p className="text-sm text-slate-500">No vendors assigned to this event.</p>
                ) : (
                  <div className="space-y-2">
                    {vendorAssignments.map((assignment, index) => (
                      <div key={`${assignment?.vendorId || assignment?.id || index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span>{getVendorLabel(assignment, index)}</span>
                        <span className="font-semibold">{formatINR(toCurrencyNumber(assignment?.agreedCost))}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900">
                      <span>Total Vendor Commitments</span>
                      <span>{formatINR(vendorCommitted)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">Expenses</h2>
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold text-slate-900">{expense.description}</p>
                        <p className="text-xs text-slate-500">{expense.category} | {expense.expenseDate || "-"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatINR(expense.amount)}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteExpense(eventId, expense.id);
                              toast.success("Expense removed.");
                              await loadData();
                            } catch (error) {
                              toast.error(getApiErrorMessage(error, "Failed to delete expense."));
                            }
                          }}
                          className="rounded-md border border-red-300 bg-red-100 px-2 py-1 text-xs text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 ? <p className="text-sm text-slate-500">No expenses logged yet.</p> : null}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
