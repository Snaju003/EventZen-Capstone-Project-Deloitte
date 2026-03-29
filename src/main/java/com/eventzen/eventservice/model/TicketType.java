package com.eventzen.eventservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketType {

    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();

    private String name;
    private String description;
    private Double price;
    private Integer maxQuantity;
}
