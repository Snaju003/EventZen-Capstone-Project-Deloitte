package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.VendorRequestDTO;
import com.eventzen.eventservice.dto.VendorRoleSyncRequestDTO;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Vendor;
import com.eventzen.eventservice.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    public Vendor createVendor(VendorRequestDTO dto) {
        Vendor vendor = Vendor.builder()
                .name(dto.getName())
                .contactEmail(dto.getContactEmail())
                .serviceType(dto.getServiceType())
                .createdAt(LocalDateTime.now())
                .build();
        return vendorRepository.save(vendor);
    }

    public Vendor syncVendorFromApprovedRole(VendorRoleSyncRequestDTO dto) {
        return vendorRepository.findByUserId(dto.getUserId())
                .map(existingVendor -> {
                    if (dto.getName() != null && !dto.getName().isBlank()) {
                        existingVendor.setName(dto.getName().trim());
                    }
                    if (dto.getContactEmail() != null && !dto.getContactEmail().isBlank()) {
                        existingVendor.setContactEmail(dto.getContactEmail().trim().toLowerCase());
                    }
                    if (existingVendor.getCreatedAt() == null) {
                        existingVendor.setCreatedAt(LocalDateTime.now());
                    }
                    return vendorRepository.save(existingVendor);
                })
                .orElseGet(() -> {
                    Vendor vendor = Vendor.builder()
                            .userId(dto.getUserId().trim())
                            .name(dto.getName() == null || dto.getName().isBlank() ? "Vendor" : dto.getName().trim())
                            .contactEmail(dto.getContactEmail() == null ? null : dto.getContactEmail().trim().toLowerCase())
                            .serviceType("RoleApprovedVendor")
                            .createdAt(LocalDateTime.now())
                            .build();

                    return vendorRepository.save(vendor);
                });
    }

    public List<Vendor> getVendors() {
        return vendorRepository.findAll();
    }

    public Vendor getVendorById(String id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
    }

    public Vendor updateVendor(String id, VendorRequestDTO dto) {
        Vendor vendor = getVendorById(id);
        vendor.setName(dto.getName());
        vendor.setContactEmail(dto.getContactEmail());
        vendor.setServiceType(dto.getServiceType());
        return vendorRepository.save(vendor);
    }

    public void deleteVendor(String id) {
        getVendorById(id); // ensure it exists
        vendorRepository.deleteById(id);
    }
}
