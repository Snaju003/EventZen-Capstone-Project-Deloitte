package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VenueRequestDTO {

    @NotBlank(message = "Venue name is required")
    private String name;

    private String address;

    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;

    private String description;
}
