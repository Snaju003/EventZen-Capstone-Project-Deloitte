import CustomCalendar from "@/components/ui/CustomCalendar";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { BudgetReceiptIcon } from "@/pages/admin/components/budget/BudgetIcons";

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
            <CustomCalendar
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
