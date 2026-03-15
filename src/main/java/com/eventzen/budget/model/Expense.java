package com.eventzen.budget.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class Expense {

    private String id;
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String category;

    public Expense() {
    }

    public Expense(String id, String description, BigDecimal amount, LocalDate expenseDate, String category) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.category = category;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static Expense create(String description, BigDecimal amount, LocalDate expenseDate, String category) {
        return Expense.builder()
                .id(UUID.randomUUID().toString())
                .description(description)
                .amount(amount)
                .expenseDate(expenseDate)
                .category(category)
                .build();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public static final class Builder {
        private String id;
        private String description;
        private BigDecimal amount;
        private LocalDate expenseDate;
        private String category;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder expenseDate(LocalDate expenseDate) {
            this.expenseDate = expenseDate;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public Expense build() {
            return new Expense(id, description, amount, expenseDate, category);
        }
    }
}
