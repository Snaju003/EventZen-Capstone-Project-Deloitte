package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.VendorAssignmentDTO;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.model.EventVendor;
import com.eventzen.eventservice.model.Vendor;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VendorRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

class EventAssignmentOperations {

    private final EventRepository eventRepository;
    private final VendorRepository vendorRepository;
    private final EventReadOperations eventReadOperations;
    private final EventValidationOperations eventValidationOperations;
    private final EventVendorOperations eventVendorOperations;
    private final KafkaNotificationPublisher kafkaNotificationPublisher;

    EventAssignmentOperations(
            EventRepository eventRepository,
            VendorRepository vendorRepository,
            EventReadOperations eventReadOperations,
            EventValidationOperations eventValidationOperations,
            EventVendorOperations eventVendorOperations,
            KafkaNotificationPublisher kafkaNotificationPublisher
    ) {
        this.eventRepository = eventRepository;
        this.vendorRepository = vendorRepository;
        this.eventReadOperations = eventReadOperations;
        this.eventValidationOperations = eventValidationOperations;
        this.eventVendorOperations = eventVendorOperations;
        this.kafkaNotificationPublisher = kafkaNotificationPublisher;
    }

    Event addVendorToEvent(String eventId, VendorAssignmentDTO dto, String requesterRole) {
        eventValidationOperations.assertAdminAction(requesterRole);
        Event event = eventReadOperations.getEventById(eventId);

        vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", dto.getVendorId()));

        boolean alreadyAssigned = event.getVendors().stream()
                .anyMatch(v -> v.getVendorId().equals(dto.getVendorId()));
        if (alreadyAssigned) {
            throw new IllegalArgumentException("Vendor is already assigned to this event");
        }

        EventVendor eventVendor = EventVendor.builder()
                .vendorId(dto.getVendorId())
                .agreedCost(dto.getAgreedCost())
                .build();

        event.getVendors().add(eventVendor);
        return eventRepository.save(event);
    }

    Event approveEventVendor(String eventId, String vendorId, String requesterId, String requesterRole) {
        eventValidationOperations.assertAdminAction(requesterRole);
        Event event = eventReadOperations.getEventById(eventId);

        boolean vendorAssigned = event.getVendors().stream()
                .anyMatch(assignment -> assignment.getVendorId().equals(vendorId));

        if (!vendorAssigned) {
            throw new ResourceNotFoundException("Vendor assignment not found for vendorId: " + vendorId);
        }

        Vendor vendor = eventVendorOperations.applyApprovedVendor(event, vendorId);
        event.setStatus("pending_vendor");
        event.setApprovedBy(requesterId);
        event.setApprovedAt(LocalDateTime.now());

        Event savedEvent = eventRepository.save(event);
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventId", savedEvent.getId());
        payload.put("eventTitle", savedEvent.getTitle());
        payload.put("vendorId", vendorId);
        payload.put("vendorUserId", vendor.getUserId());
        payload.put("adminUserId", requesterId);
        kafkaNotificationPublisher.publish("event.vendor-assigned", payload);

        return savedEvent;
    }

    Event removeVendorFromEvent(String eventId, String vendorId, String requesterRole) {
        eventValidationOperations.assertAdminAction(requesterRole);
        Event event = eventReadOperations.getEventById(eventId);

        boolean removed = event.getVendors().removeIf(v -> v.getVendorId().equals(vendorId));
        if (!removed) {
            throw new ResourceNotFoundException("Vendor assignment not found for vendorId: " + vendorId);
        }

        if (vendorId.equals(event.getApprovedVendorId())) {
            event.setApprovedVendorId(null);
            event.setApprovedVendorUserId(null);
        }

        return eventRepository.save(event);
    }
}
