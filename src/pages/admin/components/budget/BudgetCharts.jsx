import { formatINR } from "@/lib/currency";
import { BudgetEmptyIcon } from "@/pages/admin/components/budget/BudgetIcons";
import { chartPalette, toPercent } from "@/pages/admin/components/budget/adminBudget.constants";

export function BudgetCharts({
  allocationDenominator,
  allocationGradient,
  allocationSegments,
  maxCategoryAmount,
  totals,
  utilizationPercent,
}) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="surface-card surface-card-hover p-5">
        <h2 className="text-lg font-bold text-slate-900">Budget Allocation</h2>
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

      <div className="surface-card surface-card-hover p-5">
        <h2 className="text-lg font-bold text-slate-900">Category Spend</h2>
        <p className="mt-1 text-sm text-slate-500">Bar graph of logged expenses by category.</p>

        <div className="mt-5 space-y-3">
          {totals.map((item, index) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.category}</span>
                <span className="font-semibold text-slate-900">{formatINR(item.amount)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#ede8dc]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: item.amount > 0 ? `${Math.max(6, (item.amount / maxCategoryAmount) * 100)}%` : "0%",
                    backgroundColor: chartPalette[index % chartPalette.length],
                  }}
                />
              </div>
            </div>
          ))}

          {totals.length === 0 ? (
            <div className="py-6 text-center">
              <BudgetEmptyIcon />
              <p className="mt-2 text-sm text-slate-500">No expense totals yet.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
