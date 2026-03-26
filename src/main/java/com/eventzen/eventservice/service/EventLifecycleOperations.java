package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Budget;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.repository.EventRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

class EventLifecycleOperations {

    private final EventRepository eventRepository;
    private final EventReadOperations eventReadOperations;
    private final EventValidationOperations eventValidationOperations;
    private final EventVendorOperations eventVendorOperations;

    EventLifecycleOperations(
            EventRepository eventRepository,
            EventReadOperations eventReadOperations,
            EventValidationOperations eventValidationOperations,
            EventVendorOperations eventVendorOperations
    ) {
        this.eventRepository = eventRepository;
        this.eventReadOperations = eventReadOperations;
        this.eventValidationOperations = eventValidationOperations;
        this.eventVendorOperations = eventVendorOperations;
    }

    Event createEvent(EventRequestDTO dto, String createdBy, String creatorRole, long eventMinLeadHours) {
        eventValidationOperations.assertVenueExists(dto.getVenueId());
        eventValidationOperations.assertTimeRangeValid(dto.getStartTime(), dto.getEndTime());
        eventValidationOperations.assertEventStartMeetsLeadTime(dto.getStartTime(), eventMinLeadHours);

        if ("vendor".equalsIgnoreCase(creatorRole)) {
            if (dto.getAgreedCost() == null) {
                throw new IllegalArgumentException("Agreed cost is required for vendor event requests");
            }

            eventValidationOperations.assertNoVendorVenueTimeConflict(
                    createdBy,
                    dto.getVenueId(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    null
            );
            eventValidationOperations.assertNoVendorTimeConflict(createdBy, dto.getStartTime(), dto.getEndTime(), null);
        }

        eventValidationOperations.assertNoPublishedVenueTimeConflict(dto.getVenueId(), dto.getStartTime(), dto.getEndTime(), null);

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .venueId(dto.getVenueId())
                .createdBy(createdBy)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .ticketPrice(dto.getTicketPrice())
                .maxAttendees(dto.getMaxAttendees())
                .imageUrls(normalizeImageUrls(dto.getImageUrls()))
                .status("draft")
                .budget(Budget.builder().totalBudget(0.0).spent(0.0).expenses(new ArrayList<>()).build())
                .vendors(eventVendorOperations.resolveInitialVendors(createdBy, creatorRole, dto.getAgreedCost()))
                .build();

        return eventRepository.save(event);
    }

    Event updateEvent(String id, EventRequestDTO dto, String requesterId, String requesterRole, long eventMinLeadHours) {
        Event event = eventReadOperations.getEventById(id);

        if ("cancelled".equals(event.getStatus())) {
            throw new ForbiddenException("Cannot update a cancelled event");
        }

        eventValidationOperations.assertVenueExists(dto.getVenueId());
        eventValidationOperations.assertTimeRangeValid(dto.getStartTime(), dto.getEndTime());
        eventValidationOperations.assertEventStartMeetsLeadTime(dto.getStartTime(), eventMinLeadHours);

        if ("vendor".equalsIgnoreCase(requesterRole)) {
            if (!Objects.equals(event.getCreatedBy(), requesterId)) {
                throw new ForbiddenException("Vendors can only update their own events");
            }

            if (dto.getAgreedCost() == null) {
                throw new IllegalArgumentException("Agreed cost is required for vendor event requests");
            }

            eventValidationOperations.assertNoVendorVenueTimeConflict(
                    requesterId,
                    dto.getVenueId(),
                    dto.getStartTime(),
                    dto.getEndTime(),
                    id
            );
            eventValidationOperations.assertNoVendorTimeConflict(requesterId, dto.getStartTime(), dto.getEndTime(), id);
            eventVendorOperations.syncCreatorVendorAssignmentCost(event, requesterId, dto.getAgreedCost());
        }

        eventValidationOperations.assertNoPublishedVenueTimeConflict(dto.getVenueId(), dto.getStartTime(), dto.getEndTime(), id);

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setVenueId(dto.getVenueId());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setTicketPrice(dto.getTicketPrice());
        event.setMaxAttendees(dto.getMaxAttendees());

        if (dto.getImageUrls() != null) {
            event.setImageUrls(normalizeImageUrls(dto.getImageUrls()));
        }

        if ("vendor".equalsIgnoreCase(requesterRole) && "rejected".equalsIgnoreCase(event.getStatus())) {
            event.setStatus("draft");
            event.setRejectedBy(null);
            event.setRejectedAt(null);
            event.setRejectionReason(null);
        }

        return eventRepository.save(event);
    }

    void deleteEvent(String id) {
        eventReadOperations.getEventById(id);
        eventRepository.deleteById(id);
    }

    Event publishEvent(String id, String requesterId, String requesterRole, long eventMinLeadHours) {
        Event event = eventReadOperations.getEventById(id);
        eventValidationOperations.assertAdminAction(requesterRole);

        if (!"draft".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only draft events can be published");
        }

        eventValidationOperations.assertEventStartMeetsLeadTime(event.getStartTime(), eventMinLeadHours);
        eventValidationOperations.assertNoPublishedVenueTimeConflict(event.getVenueId(), event.getStartTime(), event.getEndTime(), id);

        if (!event.getVendors().isEmpty()) {
            String approvedVendorId = eventVendorOperations.resolveApprovedVendorIdForPublish(event);
            eventVendorOperations.applyApprovedVendor(event, approvedVendorId);
        } else {
            event.setApprovedVendorId(null);
            event.setApprovedVendorUserId(null);
        }

        event.setStatus("published");
        event.setApprovedBy(requesterId);
        event.setApprovedAt(LocalDateTime.now());
        event.setRejectedBy(null);
        event.setRejectedAt(null);
        event.setRejectionReason(null);
        return eventRepository.save(event);
    }

    Event rejectEvent(String id, String rejectionReason, String requesterId, String requesterRole) {
        Event event = eventReadOperations.getEventById(id);
        eventValidationOperations.assertAdminAction(requesterRole);

        if (!"draft".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only draft events can be rejected");
        }

        event.setStatus("rejected");
        event.setRejectedBy(requesterId);
        event.setRejectedAt(LocalDateTime.now());
        event.setRejectionReason(rejectionReason == null ? "" : rejectionReason.trim());
        event.setApprovedBy(null);
        event.setApprovedAt(null);
        event.setApprovedVendorId(null);
        event.setApprovedVendorUserId(null);

        return eventRepository.save(event);
    }

    Event cancelEvent(String id, String requesterId, String requesterRole) {
        Event event = eventReadOperations.getEventById(id);

        if ("vendor".equalsIgnoreCase(requesterRole) && !Objects.equals(event.getCreatedBy(), requesterId)) {
            throw new ForbiddenException("Vendors can only cancel their own events");
        }

        if ("cancelled".equals(event.getStatus())) {
            throw new IllegalArgumentException("Event is already cancelled");
        }

        event.setStatus("cancelled");
        return eventRepository.save(event);
    }

    private List<String> normalizeImageUrls(List<String> imageUrls) {
        if (imageUrls == null) {
            return new ArrayList<>();
        }

        return imageUrls.stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .limit(10)
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
