package com.eventzen.eventservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorRequestDTO {

    @NotBlank(message = "Vendor name is required")
    private String name;

    @Email(message = "A valid contact email is required")
    @NotBlank(message = "Contact email is required")
    private String contactEmail;

    private String serviceType;
}
