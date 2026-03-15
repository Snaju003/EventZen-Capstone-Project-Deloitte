package com.eventzen.budget.dto;

import java.math.BigDecimal;

public class BudgetSummaryResponse {

    private BigDecimal totalBudget;
    private BigDecimal spent;
    private BigDecimal remaining;
    private boolean overBudget;

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

    public BigDecimal getRemaining() {
        return remaining;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    public boolean isOverBudget() {
        return overBudget;
    }

    public void setOverBudget(boolean overBudget) {
        this.overBudget = overBudget;
    }

    public static final class Builder {
        private final BudgetSummaryResponse response = new BudgetSummaryResponse();

        public Builder totalBudget(BigDecimal totalBudget) {
            response.setTotalBudget(totalBudget);
            return this;
        }

        public Builder spent(BigDecimal spent) {
            response.setSpent(spent);
            return this;
        }

        public Builder remaining(BigDecimal remaining) {
            response.setRemaining(remaining);
            return this;
        }

        public Builder isOverBudget(boolean overBudget) {
            response.setOverBudget(overBudget);
            return this;
        }

        public BudgetSummaryResponse build() {
            return response;
        }
    }
}
