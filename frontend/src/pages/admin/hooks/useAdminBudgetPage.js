import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "@/lib/auth-api";
import {
  addExpense,
  deleteExpense,
  getBudgetExpenses,
  getBudgetSummary,
  updateBudget,
} from "@/lib/budget-api";
import { getEventById, getVendors } from "@/lib/events-api";
import {
  buildConicGradient,
  categories,
  chartPalette,
  getTodayISO,
  toCurrencyNumber,
} from "@/pages/admin/components/budget/adminBudget.constants";

function createVendorMap(vendors) {
  const map = {};
  vendors.forEach((vendor) => {
    if (vendor?.id) {
      map[vendor.id] = vendor;
    }
  });
  return map;
}

export function useAdminBudgetPage({ eventId, isAdmin }) {
  const [event, setEvent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [vendorMap, setVendorMap] = useState({});
  const [totalBudgetInput, setTotalBudgetInput] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    expenseDate: getTodayISO(),
    category: categories[0],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState("");

  const loadData = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    try {
      const [eventData, summaryData, expensesData, vendorList] = await Promise.all([
        getEventById(eventId),
        getBudgetSummary(eventId),
        getBudgetExpenses(eventId),
        getVendors().catch(() => []),
      ]);

      setEvent(eventData);
      setSummary(summaryData);
      setExpenses(expensesData.expenses || []);
      setGrouped(expensesData.groupedByCategory || {});
      setTotalBudgetInput(String(summaryData?.totalBudget ?? ""));
      setVendorMap(createVendorMap(vendorList));
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

    if (!isAdmin) {
      toast.error("Only admins can set total budget.");
      return;
    }

    if (isSavingBudget) return;

    setIsSavingBudget(true);
    try {
      await updateBudget(eventId, Number(totalBudgetInput));
      toast.success("Budget updated.");
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update budget."));
    } finally {
      setIsSavingBudget(false);
    }
  };

  const submitExpense = async (submitEvent) => {
    submitEvent.preventDefault();
    if (isAddingExpense) return;

    setIsAddingExpense(true);
    try {
      await addExpense(eventId, {
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        expenseDate: expenseForm.expenseDate,
        category: expenseForm.category,
      });
      toast.success("Expense added.");
      setExpenseForm({ description: "", amount: "", expenseDate: getTodayISO(), category: categories[0] });
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add expense."));
    } finally {
      setIsAddingExpense(false);
    }
  };

  const removeExpense = async (expenseId) => {
    if (deletingExpenseId === expenseId) return;

    setDeletingExpenseId(expenseId);
    try {
      await deleteExpense(eventId, expenseId);
      toast.success("Expense removed.");
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete expense."));
    } finally {
      setDeletingExpenseId("");
    }
  };

  const handleDeleteClick = (expenseId) => {
    if (confirmDeleteId === expenseId) {
      removeExpense(expenseId);
      setConfirmDeleteId("");
      return;
    }

    setConfirmDeleteId(expenseId);
    setTimeout(() => {
      setConfirmDeleteId((current) => (current === expenseId ? "" : current));
    }, 3000);
  };

  const getResolvedVendorLabel = useCallback((assignment, index) => {
    const vendorId = assignment?.vendorId;
    if (vendorId && vendorMap[vendorId]) {
      return vendorMap[vendorId].name || `Vendor ${index + 1}`;
    }

    return assignment?.vendorName || assignment?.name || assignment?.vendor?.name || `Vendor ${index + 1}`;
  }, [vendorMap]);

  const getVendorServiceType = useCallback((assignment) => {
    const vendorId = assignment?.vendorId;
    if (vendorId && vendorMap[vendorId]) {
      return vendorMap[vendorId].serviceType || null;
    }
    return assignment?.serviceType || null;
  }, [vendorMap]);

  const totals = useMemo(() => {
    return Object.entries(grouped)
      .map(([category, amount]) => ({ category, amount: toCurrencyNumber(amount) }))
      .sort((a, b) => b.amount - a.amount);
  }, [grouped]);

  const vendorAssignments = useMemo(() => (Array.isArray(event?.vendors) ? event.vendors : []), [event]);
  const vendorCommitted = useMemo(() => vendorAssignments.reduce((total, assignment) => total + toCurrencyNumber(assignment?.agreedCost), 0), [vendorAssignments]);
  const spentFromExpenses = useMemo(() => expenses.reduce((total, expense) => total + toCurrencyNumber(expense?.amount), 0), [expenses]);

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

  const allocationGradient = useMemo(() => buildConicGradient(allocationSegments, allocationDenominator), [allocationDenominator, allocationSegments]);
  const maxCategoryAmount = useMemo(() => (totals.length ? Math.max(...totals.map((item) => item.amount), 1) : 1), [totals]);

  return {
    event,
    summary,
    expenses,
    grouped,
    totalBudgetInput,
    setTotalBudgetInput,
    expenseForm,
    setExpenseForm,
    isLoading,
    isSavingBudget,
    isAddingExpense,
    deletingExpenseId,
    confirmDeleteId,
    loadData,
    submitBudget,
    submitExpense,
    handleDeleteClick,
    getResolvedVendorLabel,
    getVendorServiceType,
    totals,
    vendorAssignments,
    vendorCommitted,
    spentFromExpenses,
    totalBudget,
    committedSpend,
    remaining,
    overBudgetAmount,
    isOverBudget,
    allocationDenominator,
    utilizationPercent,
    allocationSegments,
    allocationGradient,
    maxCategoryAmount,
  };
}
