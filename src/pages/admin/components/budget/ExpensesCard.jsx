import { formatINR } from "@/lib/currency";
import { BudgetEmptyIcon } from "@/pages/admin/components/budget/BudgetIcons";
import {
  categoryColors,
  formatExpenseDate,
} from "@/pages/admin/components/budget/adminBudget.constants";

export function ExpensesCard({
  confirmDeleteId,
  deletingExpenseId,
  expenses,
  onDeleteClick,
}) {
  return (
    <div className="surface-card surface-card-hover p-5">
      <h2 className="mb-3 text-lg font-bold text-slate-900">Expenses</h2>

      <div className="space-y-2">
        {expenses.map((expense) => {
          const catColor = categoryColors[expense.category] || "#64748b";
          const isConfirming = confirmDeleteId === expense.id;
          const isDeleting = deletingExpenseId === expense.id;

          return (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: catColor }}
                  title={expense.category}
                />
                <div>
                  <p className="font-semibold text-slate-900">{expense.description}</p>
                  <p className="text-xs text-slate-500">
                    <span className="inline-block rounded-sm bg-slate-100 px-1 py-px font-medium">{expense.category}</span>
                    <span className="mx-1.5">·</span>
                    {formatExpenseDate(expense.expenseDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold whitespace-nowrap">{formatINR(expense.amount)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteClick(expense.id)}
                  disabled={isDeleting}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                    isConfirming
                      ? "border-red-400 bg-red-500 text-white"
                      : "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  {isDeleting ? "Deleting..." : isConfirming ? "Confirm?" : "Delete"}
                </button>
              </div>
            </div>
          );
        })}

        {expenses.length === 0 ? (
          <div className="py-6 text-center">
            <BudgetEmptyIcon />
            <p className="mt-2 text-sm text-slate-500">No expenses logged yet.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
