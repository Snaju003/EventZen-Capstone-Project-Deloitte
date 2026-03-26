package com.eventzen.eventservice.service;

import com.eventzen.eventservice.exception.ConflictException;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VenueRepository;

import java.time.LocalDateTime;
import java.util.List;

class EventValidationOperations {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    EventValidationOperations(EventRepository eventRepository, VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    void assertVenueExists(String venueId) {
        venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", venueId));
    }

    void assertTimeRangeValid(LocalDateTime startTime, LocalDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }
    }

    void assertEventStartMeetsLeadTime(LocalDateTime startTime, long eventMinLeadHours) {
        if (startTime == null) {
            throw new IllegalArgumentException("startTime is required");
        }

        long effectiveLeadHours = Math.max(0, eventMinLeadHours);
        LocalDateTime earliestAllowedStart = LocalDateTime.now().plusHours(effectiveLeadHours);

        if (startTime.isBefore(earliestAllowedStart)) {
            throw new IllegalArgumentException(
                    "Event start time must be at least " + effectiveLeadHours + " hours from now"
            );
        }
    }

    void assertNoVendorTimeConflict(String vendorUserId, LocalDateTime proposedStart, LocalDateTime proposedEnd, String excludedEventId) {
        if (vendorUserId == null || vendorUserId.isBlank()) {
            throw new ForbiddenException("Vendor identity is required");
        }

        List<Event> vendorEvents = eventRepository.findByCreatedBy(vendorUserId);
        boolean hasConflict = vendorEvents.stream()
                .filter(existing -> excludedEventId == null || !excludedEventId.equals(existing.getId()))
                .filter(existing -> !"cancelled".equalsIgnoreCase(existing.getStatus()))
                .filter(existing -> existing.getStartTime() != null && existing.getEndTime() != null)
                .anyMatch(existing -> proposedStart.isBefore(existing.getEndTime()) && proposedEnd.isAfter(existing.getStartTime()));

        if (hasConflict) {
            throw new ForbiddenException("You already have an event scheduled in this date/time range");
        }
    }

    void assertNoPublishedVenueTimeConflict(String venueId, LocalDateTime proposedStart, LocalDateTime proposedEnd, String excludedEventId) {
        boolean hasConflict;

        if (excludedEventId == null || excludedEventId.isBlank()) {
            hasConflict = eventRepository.existsPublishedVenueScheduleConflict(venueId, proposedStart, proposedEnd);
        } else {
            hasConflict = eventRepository.existsPublishedVenueScheduleConflictExcludingEvent(
                    venueId,
                    proposedStart,
                    proposedEnd,
                    excludedEventId
            );
        }

        if (hasConflict) {
            throw new ConflictException("Another event is already scheduled at this venue for the selected time.");
        }
    }

    void assertNoVendorVenueTimeConflict(
            String vendorUserId,
            String venueId,
            LocalDateTime proposedStart,
            LocalDateTime proposedEnd,
            String excludedEventId
    ) {
        if (vendorUserId == null || vendorUserId.isBlank()) {
            throw new ForbiddenException("Vendor identity is required");
        }

        boolean hasConflict;

        if (excludedEventId == null || excludedEventId.isBlank()) {
            hasConflict = eventRepository.existsVendorVenueScheduleConflict(
                    vendorUserId,
                    venueId,
                    proposedStart,
                    proposedEnd
            );
        } else {
            hasConflict = eventRepository.existsVendorVenueScheduleConflictExcludingEvent(
                    vendorUserId,
                    venueId,
                    proposedStart,
                    proposedEnd,
                    excludedEventId
            );
        }

        if (hasConflict) {
            throw new ConflictException("You already have an event at this venue in the selected time range.");
        }
    }

    void assertAdminAction(String requesterRole) {
        if (!"admin".equalsIgnoreCase(requesterRole)) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
