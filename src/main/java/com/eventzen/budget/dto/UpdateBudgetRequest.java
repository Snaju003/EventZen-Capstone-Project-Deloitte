package com.eventzen.budget.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateBudgetRequest {

    @NotNull(message = "totalBudget is required")
    private BigDecimal totalBudget;

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }
}
