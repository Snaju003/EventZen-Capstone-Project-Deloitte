package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.VendorRequestDTO;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Vendor;
import com.eventzen.eventservice.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .build();
        return vendorRepository.save(vendor);
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
