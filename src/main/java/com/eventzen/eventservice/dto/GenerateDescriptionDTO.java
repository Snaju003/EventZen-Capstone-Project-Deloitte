package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateDescriptionDTO {
    @NotBlank(message = "Event title is required")
    private String title;
}
