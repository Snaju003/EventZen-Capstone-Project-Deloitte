package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Venue ID is required")
    private String venueId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @PositiveOrZero(message = "Ticket price must be 0 or greater")
    private Double ticketPrice;

    @Min(value = 1, message = "Max attendees must be greater than 0")
    private Integer maxAttendees;

    @PositiveOrZero(message = "Agreed cost must be 0 or greater")
    private Double agreedCost;

    private List<String> imageUrls;
}
