package com.eventzen.budget.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class Budget {

    private BigDecimal totalBudget;
    private BigDecimal spent;
    private List<Expense> expenses = new ArrayList<>();

    public Budget() {
    }

    public Budget(BigDecimal totalBudget, BigDecimal spent, List<Expense> expenses) {
        this.totalBudget = totalBudget;
        this.spent = spent;
        this.expenses = expenses != null ? expenses : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public List<Expense> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<Expense> expenses) {
        this.expenses = expenses != null ? expenses : new ArrayList<>();
    }

    public static final class Builder {
        private BigDecimal totalBudget;
        private BigDecimal spent;
        private List<Expense> expenses = new ArrayList<>();

        public Builder totalBudget(BigDecimal totalBudget) {
            this.totalBudget = totalBudget;
            return this;
        }

        public Builder spent(BigDecimal spent) {
            this.spent = spent;
            return this;
        }

        public Builder expenses(List<Expense> expenses) {
            this.expenses = expenses != null ? expenses : new ArrayList<>();
            return this;
        }

        public Budget build() {
            return new Budget(totalBudget, spent, expenses);
        }
    }
}
