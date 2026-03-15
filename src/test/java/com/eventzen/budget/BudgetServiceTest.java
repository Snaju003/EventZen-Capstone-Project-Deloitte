package com.eventzen.budget;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.dto.CreateExpenseRequest;
import com.eventzen.budget.exception.ResourceNotFoundException;
import com.eventzen.budget.model.Budget;
import com.eventzen.budget.model.Event;
import com.eventzen.budget.model.Expense;
import com.eventzen.budget.repository.EventRepository;
import com.eventzen.budget.service.BudgetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private BudgetService budgetService;

    private Event sampleEvent;

    @BeforeEach
    void setUp() {
        Expense expense1 = Expense.builder()
                .id("exp-1")
                .description("Venue booking")
                .amount(new BigDecimal("10000"))
                .category("VENUE")
                .expenseDate(LocalDate.now())
                .build();

        Expense expense2 = Expense.builder()
                .id("exp-2")
                .description("Catering")
                .amount(new BigDecimal("25000"))
                .category("CATERING")
                .expenseDate(LocalDate.now())
                .build();

        Budget budget = Budget.builder()
                .totalBudget(new BigDecimal("50000"))
                .spent(new BigDecimal("35000"))
                .expenses(new ArrayList<>(Arrays.asList(expense1, expense2)))
                .build();

        sampleEvent = Event.builder()
                .id("event-123")
                .budget(budget)
                .build();
    }

    @Test
    void getBudgetSummary_returnsCorrectValues() {
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-123");

        assertEquals(new BigDecimal("50000"), summary.getTotalBudget());
        assertEquals(new BigDecimal("35000"), summary.getSpent());
        assertEquals(new BigDecimal("15000"), summary.getRemaining());
        assertFalse(summary.isOverBudget());
    }

    @Test
    void getBudgetSummary_overBudget_flagsCorrectly() {
        sampleEvent.getBudget().setTotalBudget(new BigDecimal("30000"));
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-123");

        assertTrue(summary.isOverBudget());
        assertEquals(new BigDecimal("-5000"), summary.getRemaining());
    }

    @Test
    void getBudgetSummary_eventNotFound_throwsException() {
        when(eventRepository.findById("bad-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                budgetService.getBudgetSummary("bad-id"));
    }

    @Test
    void addExpense_updatesSpentCorrectly() {
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setAmount(new BigDecimal("5000"));
        request.setDescription("Marketing banners");
        request.setCategory("MARKETING");
        request.setExpenseDate(LocalDate.now());

        Expense result = budgetService.addExpense("event-123", request);

        assertNotNull(result.getId());
        assertEquals(new BigDecimal("5000"), result.getAmount());
        assertEquals("MARKETING", result.getCategory());
        verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Event.class));
    }

    @Test
    void deleteExpense_removesExpenseSuccessfully() {
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        budgetService.deleteExpense("event-123", "exp-1");

        verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Event.class));
    }

    @Test
    void deleteExpense_expenseNotFound_throwsException() {
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        assertThrows(ResourceNotFoundException.class, () ->
                budgetService.deleteExpense("event-123", "non-existent-id"));
    }

    @Test
    void getExpensesGroupedByCategory_groupsCorrectly() {
        when(eventRepository.findById("event-123")).thenReturn(Optional.of(sampleEvent));

        var result = budgetService.getExpensesGroupedByCategory("event-123");

        assertEquals(new BigDecimal("10000"), result.get("VENUE"));
        assertEquals(new BigDecimal("25000"), result.get("CATERING"));
    }
}
