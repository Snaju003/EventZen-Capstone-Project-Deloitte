package com.eventzen.eventservice.service;

import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.model.EventVendor;
import com.eventzen.eventservice.repository.VendorRepository;

import java.util.ArrayList;
import java.util.List;

class EventVendorOperations {

    private final VendorRepository vendorRepository;

    EventVendorOperations(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    List<EventVendor> resolveInitialVendors(String createdBy, String creatorRole, Double agreedCost) {
        if (!"vendor".equalsIgnoreCase(creatorRole)) {
            return new ArrayList<>();
        }

        var creatorVendor = vendorRepository.findByUserId(createdBy)
                .orElseThrow(() -> new ForbiddenException("Vendor profile not found. Ask an admin to approve your vendor account first."));

        List<EventVendor> vendors = new ArrayList<>();
        vendors.add(EventVendor.builder()
                .vendorId(creatorVendor.getId())
                .agreedCost(agreedCost)
                .build());

        return vendors;
    }

    void syncCreatorVendorAssignmentCost(Event event, String vendorUserId, Double agreedCost) {
        var creatorVendor = vendorRepository.findByUserId(vendorUserId)
                .orElseThrow(() -> new ForbiddenException("Vendor profile not found. Ask an admin to approve your vendor account first."));

        boolean assignmentUpdated = false;
        for (EventVendor assignment : event.getVendors()) {
            if (creatorVendor.getId().equals(assignment.getVendorId())) {
                assignment.setAgreedCost(agreedCost);
                assignmentUpdated = true;
                break;
            }
        }

        if (!assignmentUpdated) {
            event.getVendors().add(EventVendor.builder()
                    .vendorId(creatorVendor.getId())
                    .agreedCost(agreedCost)
                    .build());
        }
    }

    String resolveApprovedVendorIdForPublish(Event event) {
        String currentApprovedVendorId = event.getApprovedVendorId();
        if (currentApprovedVendorId != null && !currentApprovedVendorId.isBlank()) {
            boolean stillAssigned = event.getVendors().stream()
                    .anyMatch(assignment -> currentApprovedVendorId.equals(assignment.getVendorId()));
            if (stillAssigned) {
                return currentApprovedVendorId;
            }
        }

        if (event.getVendors().size() == 1) {
            return event.getVendors().get(0).getVendorId();
        }

        throw new IllegalArgumentException("Select and approve a vendor before publishing this event.");
    }

    void applyApprovedVendor(Event event, String vendorId) {
        var vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", vendorId));

        event.setApprovedVendorId(vendorId);
        event.setApprovedVendorUserId(vendor.getUserId());
    }
}
