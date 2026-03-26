import { formatINR } from "@/lib/currency";

export function BudgetSummaryCards({
  isOverBudget,
  overBudgetAmount,
  remaining,
  spentFromExpenses,
  totalBudget,
  vendorCommitted,
}) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="surface-card surface-card-hover animate-fade delay-2 p-4">
        <p className="text-sm text-slate-500">Total Budget</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(totalBudget)}</p>
      </div>
      <div className="surface-card surface-card-hover animate-fade delay-2 p-4">
        <p className="text-sm text-slate-500">Vendor Agreed Cost</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(vendorCommitted)}</p>
      </div>
      <div className="surface-card surface-card-hover animate-fade delay-2 p-4">
        <p className="text-sm text-slate-500">Logged Expenses</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{formatINR(spentFromExpenses)}</p>
      </div>
      <div className="surface-card surface-card-hover animate-fade delay-2 p-4">
        <p className="text-sm text-slate-500">Remaining</p>
        <p className={`mt-2 text-2xl font-bold ${isOverBudget ? "text-red-900" : "text-slate-900"}`}>{formatINR(remaining)}</p>
      </div>

      <div className={`rounded-2xl border p-4 md:col-span-4 ${isOverBudget ? "border-red-300 bg-red-100/90" : "border-emerald-200 bg-emerald-50/90"}`}>
        <p className="text-sm text-slate-500">Status</p>
        <p className="mt-2 text-lg font-bold text-slate-900">{isOverBudget ? `Over Budget by ${formatINR(overBudgetAmount)}` : "On Track"}</p>
        <p className="mt-1 text-sm text-slate-600">Remaining budget subtracts both assigned vendor agreed costs and logged expenses.</p>
      </div>
    </section>
  );
}
