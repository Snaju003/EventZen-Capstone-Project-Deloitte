package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class VendorAssignmentDTO {

    @NotBlank(message = "Vendor ID is required")
    private String vendorId;

    @PositiveOrZero(message = "Agreed cost must be 0 or greater")
    private Double agreedCost;
}
