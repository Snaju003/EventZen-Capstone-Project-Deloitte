package com.eventzen.budget.service;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.dto.CreateExpenseRequest;
import com.eventzen.budget.dto.UpdateBudgetRequest;
import com.eventzen.budget.exception.ResourceNotFoundException;
import com.eventzen.budget.model.Budget;
import com.eventzen.budget.model.Event;
import com.eventzen.budget.model.Expense;
import com.eventzen.budget.repository.EventRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final EventRepository eventRepository;
    private final MongoTemplate mongoTemplate;

    public BudgetService(EventRepository eventRepository, MongoTemplate mongoTemplate) {
        this.eventRepository = eventRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // SET or UPDATE budget
    public void setBudget(String eventId, UpdateBudgetRequest request) {
        ensureEventExists(eventId);

        Query query = Query.query(Criteria.where("_id").is(eventId));
        Update update = new Update().set("budget.totalBudget", request.getTotalBudget());
        mongoTemplate.updateFirst(query, update, Event.class);
    }

    // ADD expense
    public Expense addExpense(String eventId, CreateExpenseRequest request) {
        ensureEventExists(eventId);

        Expense expense = Expense.create(
                request.getDescription(),
                request.getAmount(),
                request.getExpenseDate(),
                request.getCategory()
        );

        Query query = Query.query(Criteria.where("_id").is(eventId));
        Update update = new Update()
                .push("budget.expenses", expense)
                .set("budget.spent", recalculateSpent(eventId, expense.getAmount()));

        mongoTemplate.updateFirst(query, update, Event.class);
        return expense;
    }

    // DELETE expense
    public void deleteExpense(String eventId, String expenseId) {
        Event event = getEventOrThrow(eventId);
        Budget budget = getBudgetOrThrow(event, eventId);

        Expense expenseToDelete = budget.getExpenses().stream()
                .filter(expense -> expense.getId().equals(expenseId))
                .findFirst()
                .orElse(null);
        if (expenseToDelete == null) {
            throw new ResourceNotFoundException("Expense not found: " + expenseId);
        }

        BigDecimal currentSpent = budget.getSpent() != null ? budget.getSpent() : BigDecimal.ZERO;
        BigDecimal newSpent = currentSpent.subtract(expenseToDelete.getAmount());

        Query query = Query.query(Criteria.where("_id").is(eventId));
        Update update = new Update()
                .pull("budget.expenses", Query.query(Criteria.where("id").is(expenseId)))
                .set("budget.spent", newSpent);
        mongoTemplate.updateFirst(query, update, Event.class);
    }

    // GET budget summary
    public BudgetSummaryResponse getBudgetSummary(String eventId) {
        Event event = getEventOrThrow(eventId);
        Budget budget = getBudgetOrThrow(event, eventId);

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

    // GET expenses grouped by category
    public Map<String, BigDecimal> getExpensesGroupedByCategory(String eventId) {
        Event event = getEventOrThrow(eventId);
        Budget budget = getBudgetOrThrow(event, eventId);

        return budget.getExpenses().stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
    }

    // GET all expenses
    public List<Expense> getExpenses(String eventId) {
        Event event = getEventOrThrow(eventId);
        Budget budget = getBudgetOrThrow(event, eventId);
        return budget.getExpenses() != null ? budget.getExpenses() : new ArrayList<>();
    }

    // --- Helpers ---

    private BigDecimal recalculateSpent(String eventId, BigDecimal newAmount) {
        Event event = getEventOrThrow(eventId);
        Budget budget = event.getBudget();
        BigDecimal current = (budget != null && budget.getSpent() != null)
                ? budget.getSpent() : BigDecimal.ZERO;
        return current.add(newAmount);
    }

    private void ensureEventExists(String eventId) {
        if (eventRepository.findById(eventId).isEmpty()) {
            throw new ResourceNotFoundException("Event not found: " + eventId);
        }
    }

    private Event getEventOrThrow(String eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    }

    private Budget getBudgetOrThrow(Event event, String eventId) {
        if (event.getBudget() == null) {
            throw new ResourceNotFoundException("Budget not initialized for event: " + eventId);
        }
        return event.getBudget();
    }
}
