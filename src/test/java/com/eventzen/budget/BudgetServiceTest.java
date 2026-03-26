package com.eventzen.budget;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.dto.CreateExpenseRequest;
import com.eventzen.budget.exception.ResourceNotFoundException;
import com.eventzen.budget.model.EventAccessSnapshot;
import com.eventzen.budget.model.EventBudget;
import com.eventzen.budget.model.Expense;
import com.eventzen.budget.repository.EventBudgetRepository;
import com.eventzen.budget.service.BudgetService;
import com.eventzen.budget.service.EventAccessClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private EventBudgetRepository eventBudgetRepository;

    @Mock
    private EventAccessClient eventAccessClient;

    @InjectMocks
    private BudgetService budgetService;

    private EventAccessSnapshot sampleEvent;
    private EventBudget sampleBudget;

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

        sampleBudget = EventBudget.builder()
                .eventId("event-123")
                .totalBudget(new BigDecimal("50000"))
                .spent(new BigDecimal("35000"))
                .expenses(new ArrayList<>(Arrays.asList(expense1, expense2)))
                .build();

        sampleEvent = new EventAccessSnapshot();
        sampleEvent.setContractVersion("v1");
        sampleEvent.setEventId("event-123");
        sampleEvent.setCreatedBy("vendor-owner");
        sampleEvent.setApprovedVendorUserId("approved-vendor");
    }

    @Test
    void getBudgetSummary_returnsCorrectValues() {
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-123", "admin-user", "admin");

        assertEquals(new BigDecimal("50000"), summary.getTotalBudget());
        assertEquals(new BigDecimal("35000"), summary.getSpent());
        assertEquals(new BigDecimal("15000"), summary.getRemaining());
        assertFalse(summary.isOverBudget());
    }

    @Test
    void getBudgetSummary_overBudget_flagsCorrectly() {
        sampleBudget.setTotalBudget(new BigDecimal("30000"));
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        BudgetSummaryResponse summary = budgetService.getBudgetSummary("event-123", "admin-user", "admin");

        assertTrue(summary.isOverBudget());
        assertEquals(new BigDecimal("-5000"), summary.getRemaining());
    }

    @Test
    void getBudgetSummary_eventNotFound_throwsException() {
        when(eventAccessClient.getEventAccessSnapshot("bad-id")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                budgetService.getBudgetSummary("bad-id", "admin-user", "admin"));
    }

    @Test
    void addExpense_updatesSpentCorrectly() {
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setAmount(new BigDecimal("5000"));
        request.setDescription("Marketing banners");
        request.setCategory("MARKETING");
        request.setExpenseDate(LocalDate.now());

        Expense result = budgetService.addExpense("event-123", request, "admin-user", "admin");

        assertNotNull(result.getId());
        assertEquals(new BigDecimal("5000"), result.getAmount());
        assertEquals("MARKETING", result.getCategory());
        verify(eventBudgetRepository).save(any(EventBudget.class));
    }

    @Test
    void deleteExpense_removesExpenseSuccessfully() {
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        budgetService.deleteExpense("event-123", "exp-1", "admin-user", "admin");

        verify(eventBudgetRepository).save(any(EventBudget.class));
    }

    @Test
    void deleteExpense_expenseNotFound_throwsException() {
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        assertThrows(ResourceNotFoundException.class, () ->
                budgetService.deleteExpense("event-123", "non-existent-id", "admin-user", "admin"));
    }

    @Test
    void getExpensesGroupedByCategory_groupsCorrectly() {
        when(eventAccessClient.getEventAccessSnapshot("event-123")).thenReturn(Optional.of(sampleEvent));
        when(eventBudgetRepository.findById("event-123")).thenReturn(Optional.of(sampleBudget));

        var result = budgetService.getExpensesGroupedByCategory("event-123", "admin-user", "admin");

        assertEquals(new BigDecimal("10000"), result.get("VENUE"));
        assertEquals(new BigDecimal("25000"), result.get("CATERING"));
    }
}
