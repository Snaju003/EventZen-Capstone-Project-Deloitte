package com.eventzen.eventservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    private String description;
    private Double amount;
    private LocalDate expenseDate;
    private String category;
}
