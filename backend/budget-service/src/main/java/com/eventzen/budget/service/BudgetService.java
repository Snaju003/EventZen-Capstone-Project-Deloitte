package com.eventzen.budget.service;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.dto.CreateExpenseRequest;
import com.eventzen.budget.dto.ExpensesResponse;
import com.eventzen.budget.dto.UpdateBudgetRequest;
import com.eventzen.budget.exception.AccessDeniedException;
import com.eventzen.budget.exception.ResourceNotFoundException;
import com.eventzen.budget.model.EventAccessSnapshot;
import com.eventzen.budget.model.EventBudget;
import com.eventzen.budget.model.Expense;
import com.eventzen.budget.repository.EventBudgetRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private static final String ROLE_ADMIN = "admin";
    private static final String ROLE_VENDOR = "vendor";

    private final EventBudgetRepository eventBudgetRepository;
    private final EventAccessClient eventAccessClient;

    public BudgetService(EventBudgetRepository eventBudgetRepository, EventAccessClient eventAccessClient) {
        this.eventBudgetRepository = eventBudgetRepository;
        this.eventAccessClient = eventAccessClient;
    }

    public void setBudget(String eventId, UpdateBudgetRequest request, String requesterId, String requesterRole) {
        getAuthorizedEventOrThrow(eventId, requesterId, requesterRole);

        EventBudget budget = eventBudgetRepository.findById(eventId)
                .orElseGet(() -> EventBudget.builder()
                        .eventId(eventId)
                        .spent(BigDecimal.ZERO)
                        .expenses(new ArrayList<>())
                        .build());

        budget.setTotalBudget(request.getTotalBudget());
        if (budget.getSpent() == null) {
            budget.setSpent(BigDecimal.ZERO);
        }
        if (budget.getExpenses() == null) {
            budget.setExpenses(new ArrayList<>());
        }

        eventBudgetRepository.save(budget);
    }

    public Expense addExpense(String eventId, CreateExpenseRequest request, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);

        Expense expense = Expense.create(
                request.getDescription(),
                request.getAmount(),
                request.getExpenseDate(),
                request.getCategory()
        );

        List<Expense> expenses = toMutableExpenses(budget.getExpenses());
        expenses.add(expense);

        budget.setExpenses(expenses);
        budget.setSpent(calculateSpent(expenses));

        eventBudgetRepository.save(budget);
        return expense;
    }

    public void deleteExpense(String eventId, String expenseId, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);
        List<Expense> expenses = toMutableExpenses(budget.getExpenses());

        Expense expenseToDelete = expenses.stream()
                .filter(expense -> expense.getId().equals(expenseId))
                .findFirst()
                .orElse(null);
        if (expenseToDelete == null) {
            throw new ResourceNotFoundException("Expense not found: " + expenseId);
        }

        expenses.removeIf(expense -> expense.getId().equals(expenseId));
        budget.setExpenses(expenses);
        budget.setSpent(calculateSpent(expenses));
        eventBudgetRepository.save(budget);
    }

    public BudgetSummaryResponse getBudgetSummary(String eventId, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);

        BigDecimal total = budget.getTotalBudget() != null ? budget.getTotalBudget() : BigDecimal.ZERO;
        BigDecimal spent = budget.getSpent() != null ? budget.getSpent() : BigDecimal.ZERO;
        BigDecimal remaining = total.subtract(spent);

        return BudgetSummaryResponse.builder()
                .totalBudget(total)
                .spent(spent)
                .remaining(remaining)
                .isOverBudget(spent.compareTo(total) > 0)
                .build();
    }

    public Map<String, BigDecimal> getExpensesGroupedByCategory(String eventId, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);
        return groupExpensesByCategory(budget.getExpenses());
    }

    public List<Expense> getExpenses(String eventId, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);
        return toExpenseList(budget.getExpenses());
    }

    public ExpensesResponse getExpensesResponse(String eventId, String requesterId, String requesterRole) {
        EventBudget budget = getAuthorizedBudgetOrThrow(eventId, requesterId, requesterRole);
        List<Expense> expenses = toExpenseList(budget.getExpenses());
        Map<String, BigDecimal> groupedByCategory = groupExpensesByCategory(expenses);
        return new ExpensesResponse(expenses, groupedByCategory);
    }

    private EventBudget getAuthorizedBudgetOrThrow(String eventId, String requesterId, String requesterRole) {
        getAuthorizedEventOrThrow(eventId, requesterId, requesterRole);
        return getBudgetOrThrow(eventId);
    }

    private EventAccessSnapshot getEventOrThrow(String eventId) {
        return eventAccessClient.getEventAccessSnapshot(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }

    private EventAccessSnapshot getAuthorizedEventOrThrow(String eventId, String requesterId, String requesterRole) {
        EventAccessSnapshot event = getEventOrThrow(eventId);
        assertCanAccessEvent(event, requesterId, requesterRole);
        return event;
    }

    private void assertCanAccessEvent(EventAccessSnapshot event, String requesterId, String requesterRole) {
        if (requesterRole == null || requesterRole.isBlank()) {
            throw new AccessDeniedException("Admin or vendor role required");
        }

        if (ROLE_ADMIN.equalsIgnoreCase(requesterRole)) {
            return;
        }

        if (!ROLE_VENDOR.equalsIgnoreCase(requesterRole)) {
            throw new AccessDeniedException("Admin or vendor role required");
        }

        if (requesterId == null || requesterId.isBlank()) {
            throw new AccessDeniedException("Vendor identity is required");
        }

        boolean isOwner = requesterId.equals(event.getCreatedBy());
        boolean isApprovedVendor = requesterId.equals(event.getApprovedVendorUserId());
        if (!isOwner && !isApprovedVendor) {
            throw new AccessDeniedException("You can only access budgets for your own or approved events");
        }
    }

    private EventBudget getBudgetOrThrow(String eventId) {
        EventBudget budget = eventBudgetRepository.findById(eventId)
                .orElse(null);

        if (budget == null) {
            throw new ResourceNotFoundException("Budget not initialized for event: " + eventId);
        }

        return budget;
    }

    private List<Expense> toMutableExpenses(List<Expense> expenses) {
        return expenses != null ? new ArrayList<>(expenses) : new ArrayList<>();
    }

    private List<Expense> toExpenseList(List<Expense> expenses) {
        return expenses != null ? expenses : new ArrayList<>();
    }

    private Map<String, BigDecimal> groupExpensesByCategory(List<Expense> expenses) {
        if (expenses == null) {
            return Map.of();
        }

        return expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    private BigDecimal calculateSpent(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return expenses.stream()
                .map(expense -> expense.getAmount() != null ? expense.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
