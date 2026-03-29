export function BudgetPermissionsSection({
  isAdmin,
  isSavingBudget,
  onBudgetInputChange,
  onSubmit,
  totalBudgetInput,
}) {
  if (isAdmin) {
    return (
      <section className="surface-card surface-card-hover mb-6 p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Set Total Budget</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            min="0"
            step="0.01"
            value={totalBudgetInput}
            onChange={(eventInput) => onBudgetInputChange(eventInput.target.value)}
            className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3"
            disabled={isSavingBudget}
            required
          />
          <button
            type="submit"
            disabled={isSavingBudget}
            className="button-polish focus-polish h-11 bg-primary px-4 text-white disabled:opacity-60"
          >
            {isSavingBudget ? "Saving..." : "Save Budget"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="surface-card surface-card-hover mb-6 p-5">
      <h2 className="text-lg font-bold text-slate-900">Budget Permissions</h2>
      <p className="mt-1 text-sm text-slate-600">Only admins can set total budget. Vendors can add and manage expenses.</p>
    </section>
  );
}
