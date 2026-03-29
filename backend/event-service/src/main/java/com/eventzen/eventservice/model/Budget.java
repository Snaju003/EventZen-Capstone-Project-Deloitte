package com.eventzen.eventservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    private Double totalBudget;
    private Double spent;

    @Builder.Default
    private List<Expense> expenses = new ArrayList<>();
}
