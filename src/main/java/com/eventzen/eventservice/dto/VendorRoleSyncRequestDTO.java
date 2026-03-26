package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorRoleSyncRequestDTO {

    @NotBlank(message = "userId is required")
    private String userId;

    private String name;
    private String contactEmail;
}
