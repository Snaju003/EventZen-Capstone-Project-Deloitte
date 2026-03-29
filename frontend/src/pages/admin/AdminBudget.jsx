import { useParams } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { AddExpenseSection } from "@/pages/admin/components/budget/AddExpenseSection";
import { BudgetCharts } from "@/pages/admin/components/budget/BudgetCharts";
import { BudgetPermissionsSection } from "@/pages/admin/components/budget/BudgetPermissionsSection";
import { BudgetSummaryCards } from "@/pages/admin/components/budget/BudgetSummaryCards";
import { categoryOptions } from "@/pages/admin/components/budget/adminBudget.constants";
import { ExpensesCard } from "@/pages/admin/components/budget/ExpensesCard";
import { VendorAssignmentsCard } from "@/pages/admin/components/budget/VendorAssignmentsCard";
import { useAdminBudgetPage } from "@/pages/admin/hooks/useAdminBudgetPage";

export default function AdminBudget() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const {
    allocationDenominator,
    allocationGradient,
    allocationSegments,
    confirmDeleteId,
    deletingExpenseId,
    event,
    expenseForm,
    expenses,
    getResolvedVendorLabel,
    getVendorServiceType,
    handleDeleteClick,
    isAddingExpense,
    isLoading,
    isOverBudget,
    isSavingBudget,
    maxCategoryAmount,
    overBudgetAmount,
    remaining,
    setExpenseForm,
    setTotalBudgetInput,
    spentFromExpenses,
    submitBudget,
    submitExpense,
    totalBudget,
    totalBudgetInput,
    totals,
    utilizationPercent,
    vendorAssignments,
    vendorCommitted,
  } = useAdminBudgetPage({ eventId, isAdmin });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="soft-orb left-[-5rem] top-20 h-44 w-44 bg-sky-300/20" />
      <div className="soft-orb right-[-4rem] top-32 h-42 w-42 bg-emerald-200/25" style={{ animationDelay: "1.1s" }} />

      <main className="page-shell flex-1">
        <div className="animate-rise mb-6">
          <h1 className="section-title">Budget Tracker</h1>
          <p className="mt-1 text-slate-600">{event?.title || "Event"}</p>
        </div>

        <section className="hero-gradient-panel animate-rise delay-1 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Budget Intelligence</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
            Monitor commitments, expenses, and remaining headroom with visual clarity before each event milestone.
          </p>
        </section>

        {isLoading ? (
          <div className="surface-card p-6 text-center text-slate-600">Loading budget...</div>
        ) : (
          <>
            <BudgetSummaryCards
              isOverBudget={isOverBudget}
              overBudgetAmount={overBudgetAmount}
              remaining={remaining}
              spentFromExpenses={spentFromExpenses}
              totalBudget={totalBudget}
              vendorCommitted={vendorCommitted}
            />

            <BudgetCharts
              allocationDenominator={allocationDenominator}
              allocationGradient={allocationGradient}
              allocationSegments={allocationSegments}
              maxCategoryAmount={maxCategoryAmount}
              totals={totals}
              utilizationPercent={utilizationPercent}
            />

            <BudgetPermissionsSection
              isAdmin={isAdmin}
              isSavingBudget={isSavingBudget}
              onBudgetInputChange={setTotalBudgetInput}
              onSubmit={submitBudget}
              totalBudgetInput={totalBudgetInput}
            />

            <AddExpenseSection
              categoryOptions={categoryOptions}
              expenseForm={expenseForm}
              isAddingExpense={isAddingExpense}
              onExpenseFormChange={(patch) => setExpenseForm((previous) => ({ ...previous, ...patch }))}
              onSubmit={submitExpense}
            />

            <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <VendorAssignmentsCard
                getResolvedVendorLabel={getResolvedVendorLabel}
                getVendorServiceType={getVendorServiceType}
                vendorAssignments={vendorAssignments}
                vendorCommitted={vendorCommitted}
              />

              <ExpensesCard
                confirmDeleteId={confirmDeleteId}
                deletingExpenseId={deletingExpenseId}
                expenses={expenses}
                onDeleteClick={handleDeleteClick}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
