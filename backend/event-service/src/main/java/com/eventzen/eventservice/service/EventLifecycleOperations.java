package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Budget;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.model.EventVendor;
import com.eventzen.eventservice.model.TicketType;
import com.eventzen.eventservice.repository.EventRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

class EventLifecycleOperations {

    private final EventRepository eventRepository;
    private final EventReadOperations eventReadOperations;
    private final EventValidationOperations eventValidationOperations;
    private final EventVendorOperations eventVendorOperations;
    private final KafkaNotificationPublisher kafkaNotificationPublisher;
    private final BookingServiceClient bookingServiceClient;

    EventLifecycleOperations(
            EventRepository eventRepository,
            EventReadOperations eventReadOperations,
            EventValidationOperations eventValidationOperations,
            EventVendorOperations eventVendorOperations,
            KafkaNotificationPublisher kafkaNotificationPublisher,
            BookingServiceClient bookingServiceClient
    ) {
        this.eventRepository = eventRepository;
        this.eventReadOperations = eventReadOperations;
        this.eventValidationOperations = eventValidationOperations;
        this.eventVendorOperations = eventVendorOperations;
        this.kafkaNotificationPublisher = kafkaNotificationPublisher;
        this.bookingServiceClient = bookingServiceClient;
    }

    Event createEvent(EventRequestDTO dto, String createdBy, String creatorRole, long eventMinLeadHours) {
        eventValidationOperations.assertVenueExists(dto.getVenueId());
        eventValidationOperations.assertTimeRangeValid(dto.getStartTime(), dto.getEndTime());
        eventValidationOperations.assertEventStartMeetsLeadTime(dto.getStartTime(), eventMinLeadHours);

        boolean isAdmin = "admin".equalsIgnoreCase(creatorRole);
        boolean isVendor = "vendor".equalsIgnoreCase(creatorRole);

        if (isVendor) {
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

        // Admin must assign a vendor when creating an event
        if (isAdmin) {
            if (dto.getVendorId() == null || dto.getVendorId().isBlank()) {
                throw new IllegalArgumentException("Vendor selection is required when creating an event");
            }
            if (dto.getAgreedCost() == null) {
                throw new IllegalArgumentException("Agreed cost is required when assigning a vendor");
            }
            if (dto.getTotalBudget() == null) {
                throw new IllegalArgumentException("Total budget is required when creating an event");
            }
        }

        eventValidationOperations.assertNoPublishedVenueTimeConflict(dto.getVenueId(), dto.getStartTime(), dto.getEndTime(), null);

        // Determine initial status and vendor list
        String initialStatus = "draft";
        List<EventVendor> initialVendors;
        Double totalBudget = 0.0;

        if (isAdmin && dto.getVendorId() != null && !dto.getVendorId().isBlank()) {
            // Admin-created events are published immediately
            initialStatus = "published";
            initialVendors = new ArrayList<>();
            initialVendors.add(EventVendor.builder()
                    .vendorId(dto.getVendorId())
                    .agreedCost(dto.getAgreedCost())
                    .build());
            totalBudget = dto.getTotalBudget() != null ? dto.getTotalBudget() : 0.0;
        } else {
            initialVendors = eventVendorOperations.resolveInitialVendors(createdBy, creatorRole, dto.getAgreedCost());
        }

        List<TicketType> ticketTypes = normalizeTicketTypes(dto.getTicketTypes());
        Double computedTicketPrice = dto.getTicketPrice();
        Integer computedMaxAttendees = dto.getMaxAttendees();
        if (!ticketTypes.isEmpty()) {
            computedTicketPrice = ticketTypes.stream()
                    .map(TicketType::getPrice)
                    .filter(p -> p != null && p >= 0)
                    .min(Double::compareTo)
                    .orElse(0.0);
            computedMaxAttendees = ticketTypes.stream()
                    .map(TicketType::getMaxQuantity)
                    .filter(q -> q != null && q > 0)
                    .reduce(0, Integer::sum);
        }

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .venueId(dto.getVenueId())
                .createdBy(createdBy)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .ticketPrice(computedTicketPrice)
                .maxAttendees(computedMaxAttendees)
                .imageUrls(normalizeImageUrls(dto.getImageUrls()))
                .ticketTypes(ticketTypes)
                .status(initialStatus)
                .budget(Budget.builder().totalBudget(totalBudget).spent(0.0).expenses(new ArrayList<>()).build())
                .vendors(initialVendors)
                .build();

        // If admin assigned a vendor, set the approved vendor fields and approval metadata
        if (isAdmin && dto.getVendorId() != null && !dto.getVendorId().isBlank()) {
            eventVendorOperations.applyApprovedVendor(event, dto.getVendorId());
            event.setApprovedBy(createdBy);
            event.setApprovedAt(LocalDateTime.now());
        }

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
        List<TicketType> ticketTypes = normalizeTicketTypes(dto.getTicketTypes());
        if (!ticketTypes.isEmpty()) {
            event.setTicketTypes(ticketTypes);
            event.setTicketPrice(ticketTypes.stream()
                    .map(TicketType::getPrice)
                    .filter(p -> p != null && p >= 0)
                    .min(Double::compareTo)
                    .orElse(0.0));
            event.setMaxAttendees(ticketTypes.stream()
                    .map(TicketType::getMaxQuantity)
                    .filter(q -> q != null && q > 0)
                    .reduce(0, Integer::sum));
        } else {
            event.setTicketPrice(dto.getTicketPrice());
            event.setMaxAttendees(dto.getMaxAttendees());
        }

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

        int confirmedSeatCount = bookingServiceClient.getConfirmedSeatCount(id);
        if (confirmedSeatCount > 0) {
            throw new IllegalArgumentException("Cannot delete event with existing confirmed bookings. Cancel the event instead.");
        }

        eventRepository.deleteById(id);
    }

    Event vendorAcceptEvent(String id, String vendorUserId) {
        Event event = eventReadOperations.getEventById(id);

        if (!"pending_vendor".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only events awaiting vendor confirmation can be accepted");
        }

        // Verify the requesting vendor is the assigned vendor
        String assignedVendorUserId = event.getApprovedVendorUserId();
        if (assignedVendorUserId == null || !assignedVendorUserId.equals(vendorUserId)) {
            throw new ForbiddenException("You are not the assigned vendor for this event");
        }

        event.setStatus("draft");
        Event savedEvent = eventRepository.save(event);

        Map<String, Object> vendorConfirmedPayload = new HashMap<>();
        vendorConfirmedPayload.put("eventId", savedEvent.getId());
        vendorConfirmedPayload.put("eventTitle", savedEvent.getTitle());
        vendorConfirmedPayload.put("vendorUserId", vendorUserId);
        vendorConfirmedPayload.put("vendorName", "Vendor");
        vendorConfirmedPayload.put("adminUserId", savedEvent.getApprovedBy());
        kafkaNotificationPublisher.publish("event.vendor-confirmed", vendorConfirmedPayload);

        return savedEvent;
    }

    Event vendorDeclineEvent(String id, String vendorUserId, String reason) {
        Event event = eventReadOperations.getEventById(id);

        if (!"pending_vendor".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only events awaiting vendor confirmation can be declined");
        }

        // Verify the requesting vendor is the assigned vendor
        String assignedVendorUserId = event.getApprovedVendorUserId();
        if (assignedVendorUserId == null || !assignedVendorUserId.equals(vendorUserId)) {
            throw new ForbiddenException("You are not the assigned vendor for this event");
        }

        String approvedBy = event.getApprovedBy();
        String eventTitle = event.getTitle();
        String eventId = event.getId();

        // Clear vendor assignment and return to draft so admin can reassign
        event.setStatus("draft");
        event.getVendors().clear();
        event.setApprovedVendorId(null);
        event.setApprovedVendorUserId(null);

        Event savedEvent = eventRepository.save(event);
        Map<String, Object> vendorDeclinedPayload = new HashMap<>();
        vendorDeclinedPayload.put("eventId", eventId);
        vendorDeclinedPayload.put("eventTitle", eventTitle);
        vendorDeclinedPayload.put("vendorUserId", vendorUserId);
        vendorDeclinedPayload.put("vendorName", "Vendor");
        vendorDeclinedPayload.put("adminUserId", approvedBy);
        kafkaNotificationPublisher.publish("event.vendor-declined", vendorDeclinedPayload);

        return savedEvent;
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

        Event savedEvent = eventRepository.save(event);
        Map<String, Object> eventPublishedPayload = new HashMap<>();
        eventPublishedPayload.put("eventId", savedEvent.getId());
        eventPublishedPayload.put("eventTitle", savedEvent.getTitle());
        eventPublishedPayload.put("adminUserId", requesterId);
        kafkaNotificationPublisher.publish("event.published", eventPublishedPayload);

        return savedEvent;
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
        event.setRegistrationOpen(false);

        Event savedEvent = eventRepository.save(event);
        Map<String, Object> eventCancelledPayload = new HashMap<>();
        eventCancelledPayload.put("eventId", savedEvent.getId());
        eventCancelledPayload.put("eventTitle", savedEvent.getTitle());
        eventCancelledPayload.put("cancelledBy", requesterId);
        kafkaNotificationPublisher.publish("event.cancelled", eventCancelledPayload);

        return savedEvent;
    }

    Event toggleRegistration(String id, String requesterId, String requesterRole) {
        Event event = eventReadOperations.getEventById(id);

        if (!"published".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only published events can toggle registration");
        }

        // Admin can always toggle; vendor can only toggle their own event
        if ("vendor".equalsIgnoreCase(requesterRole)) {
            if (!Objects.equals(event.getCreatedBy(), requesterId)
                    && !requesterId.equals(event.getApprovedVendorUserId())) {
                throw new ForbiddenException("You are not authorised to toggle registration for this event");
            }
        }

        boolean newValue = !Boolean.TRUE.equals(event.getRegistrationOpen());
        event.setRegistrationOpen(newValue);
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

    private List<TicketType> normalizeTicketTypes(List<TicketType> ticketTypes) {
        if (ticketTypes == null || ticketTypes.isEmpty()) {
            return new ArrayList<>();
        }

        return ticketTypes.stream()
                .filter(tt -> tt != null && tt.getName() != null && !tt.getName().isBlank())
                .map(tt -> TicketType.builder()
                        .id(tt.getId() != null && !tt.getId().isBlank()
                                ? tt.getId()
                                : java.util.UUID.randomUUID().toString())
                        .name(tt.getName().trim())
                        .description(tt.getDescription() != null ? tt.getDescription().trim() : "")
                        .price(tt.getPrice() != null ? tt.getPrice() : 0.0)
                        .maxQuantity(tt.getMaxQuantity() != null && tt.getMaxQuantity() > 0
                                ? tt.getMaxQuantity()
                                : 1)
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
