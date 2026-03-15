package com.eventzen.budget.controller;

import com.eventzen.budget.dto.BudgetSummaryResponse;
import com.eventzen.budget.dto.CreateExpenseRequest;
import com.eventzen.budget.dto.UpdateBudgetRequest;
import com.eventzen.budget.exception.AccessDeniedException;
import com.eventzen.budget.model.Expense;
import com.eventzen.budget.service.BudgetService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // GET /budget/{eventId}
    @GetMapping("/{eventId}")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(
            @PathVariable String eventId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        assertAdmin(role);
        return ResponseEntity.ok(budgetService.getBudgetSummary(eventId));
    }

    // PUT /budget/{eventId}
    @PutMapping("/{eventId}")
    public ResponseEntity<Void> setBudget(
            @PathVariable String eventId,
            @Valid @RequestBody UpdateBudgetRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        assertAdmin(role);
        budgetService.setBudget(eventId, request);
        return ResponseEntity.noContent().build();
    }

    // GET /budget/{eventId}/expenses
    @GetMapping("/{eventId}/expenses")
    public ResponseEntity<Map<String, BigDecimal>> getExpenses(
            @PathVariable String eventId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        assertAdmin(role);
        return ResponseEntity.ok(budgetService.getExpensesGroupedByCategory(eventId));
    }

    // POST /budget/{eventId}/expenses
    @PostMapping("/{eventId}/expenses")
    public ResponseEntity<Expense> addExpense(
            @PathVariable String eventId,
            @Valid @RequestBody CreateExpenseRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        assertAdmin(role);
        Expense expense = budgetService.addExpense(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    // DELETE /budget/{eventId}/expenses/{expenseId}
    @DeleteMapping("/{eventId}/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable String eventId,
            @PathVariable String expenseId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        assertAdmin(role);
        budgetService.deleteExpense(eventId, expenseId);
        return ResponseEntity.noContent().build();
    }

    private void assertAdmin(String role) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            throw new AccessDeniedException("Admin role required");
        }
    }
}
