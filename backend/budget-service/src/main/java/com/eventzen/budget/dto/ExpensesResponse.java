package com.eventzen.budget.dto;

import com.eventzen.budget.model.Expense;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ExpensesResponse {

    private List<Expense> expenses;
    private Map<String, BigDecimal> groupedByCategory;

    public ExpensesResponse() {
    }

    public ExpensesResponse(List<Expense> expenses, Map<String, BigDecimal> groupedByCategory) {
        this.expenses = expenses;
        this.groupedByCategory = groupedByCategory;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses;
    }

    public Map<String, BigDecimal> getGroupedByCategory() {
        return groupedByCategory;
    }

    public void setGroupedByCategory(Map<String, BigDecimal> groupedByCategory) {
        this.groupedByCategory = groupedByCategory;
    }
}
