package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventRejectionDTO {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
