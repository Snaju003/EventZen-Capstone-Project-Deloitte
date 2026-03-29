package com.eventzen.budget.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Document("event_budgets")
public class EventBudget {

    @Id
    private String eventId;

    private BigDecimal totalBudget;
    private BigDecimal spent;
    private List<Expense> expenses = new ArrayList<>();

    public EventBudget() {
    }

    public EventBudget(String eventId, BigDecimal totalBudget, BigDecimal spent, List<Expense> expenses) {
        this.eventId = eventId;
        this.totalBudget = totalBudget;
        this.spent = spent;
        this.expenses = expenses != null ? expenses : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
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
        private String eventId;
        private BigDecimal totalBudget;
        private BigDecimal spent;
        private List<Expense> expenses = new ArrayList<>();

        public Builder eventId(String eventId) {
            this.eventId = eventId;
            return this;
        }

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

        public EventBudget build() {
            return new EventBudget(eventId, totalBudget, spent, expenses);
        }
    }
}
