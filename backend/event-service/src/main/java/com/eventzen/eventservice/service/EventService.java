package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.EventPageResponse;
import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.dto.VendorAssignmentDTO;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VendorRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventService {

    private final EventReadOperations eventReadOperations;
    private final EventLifecycleOperations eventLifecycleOperations;
    private final EventAssignmentOperations eventAssignmentOperations;

    @Value("${EVENT_MIN_LEAD_HOURS:24}")
    private long eventMinLeadHours;

    public EventService(
            EventRepository eventRepository,
            VenueRepository venueRepository,
            VendorRepository vendorRepository,
            KafkaNotificationPublisher kafkaNotificationPublisher,
            BookingServiceClient bookingServiceClient
    ) {
        EventValidationOperations eventValidationOperations = new EventValidationOperations(eventRepository, venueRepository);
        EventVendorOperations eventVendorOperations = new EventVendorOperations(vendorRepository);

        this.eventReadOperations = new EventReadOperations(eventRepository, venueRepository);
        this.eventLifecycleOperations = new EventLifecycleOperations(
                eventRepository,
                eventReadOperations,
                eventValidationOperations,
                eventVendorOperations,
                kafkaNotificationPublisher,
                bookingServiceClient
        );
        this.eventAssignmentOperations = new EventAssignmentOperations(
                eventRepository,
                vendorRepository,
                eventReadOperations,
                eventValidationOperations,
                eventVendorOperations,
                kafkaNotificationPublisher
        );
    }

    public Event createEvent(EventRequestDTO dto, String createdBy, String creatorRole) {
        return eventLifecycleOperations.createEvent(dto, createdBy, creatorRole, eventMinLeadHours);
    }

    public List<Event> getEvents(String requesterId, String role, String status, String venueId, LocalDate startDate, LocalDate endDate) {
        return eventReadOperations.getEvents(requesterId, role, status, venueId, startDate, endDate);
    }

    public EventPageResponse getEventsPage(
            String requesterId,
            String role,
            String status,
            String venueId,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Integer page,
            Integer size,
            String sortBy,
            String sortDir
    ) {
        return eventReadOperations.getEventsPage(
                requesterId,
                role,
                status,
                venueId,
                startDate,
                endDate,
                search,
                page,
                size,
                sortBy,
                sortDir
        );
    }

    public Event getEventById(String id) {
        return eventReadOperations.getEventById(id);
    }

    public Event getEventByIdInternal(String id) {
        return eventReadOperations.getEventByIdInternal(id);
    }

    public Event getEventByIdForRequester(String id, String requesterId, String requesterRole) {
        return eventReadOperations.getEventByIdForRequester(id, requesterId, requesterRole);
    }

    public Event updateEvent(String id, EventRequestDTO dto, String requesterId, String requesterRole) {
        return eventLifecycleOperations.updateEvent(id, dto, requesterId, requesterRole, eventMinLeadHours);
    }

    public void deleteEvent(String id) {
        eventLifecycleOperations.deleteEvent(id);
    }

    public Event publishEvent(String id, String requesterId, String requesterRole) {
        return eventLifecycleOperations.publishEvent(id, requesterId, requesterRole, eventMinLeadHours);
    }

    public Event rejectEvent(String id, String rejectionReason, String requesterId, String requesterRole) {
        return eventLifecycleOperations.rejectEvent(id, rejectionReason, requesterId, requesterRole);
    }

    public Event vendorAcceptEvent(String id, String vendorUserId) {
        return eventLifecycleOperations.vendorAcceptEvent(id, vendorUserId);
    }

    public Event vendorDeclineEvent(String id, String vendorUserId, String reason) {
        return eventLifecycleOperations.vendorDeclineEvent(id, vendorUserId, reason);
    }

    public Event cancelEvent(String id, String requesterId, String requesterRole) {
        return eventLifecycleOperations.cancelEvent(id, requesterId, requesterRole);
    }

    public Event toggleRegistration(String id, String requesterId, String requesterRole) {
        return eventLifecycleOperations.toggleRegistration(id, requesterId, requesterRole);
    }

    public Event addVendorToEvent(String eventId, VendorAssignmentDTO dto, String requesterRole) {
        return eventAssignmentOperations.addVendorToEvent(eventId, dto, requesterRole);
    }

    public Event approveEventVendor(String eventId, String vendorId, String requesterId, String requesterRole) {
        return eventAssignmentOperations.approveEventVendor(eventId, vendorId, requesterId, requesterRole);
    }

    public Event removeVendorFromEvent(String eventId, String vendorId, String requesterRole) {
        return eventAssignmentOperations.removeVendorFromEvent(eventId, vendorId, requesterRole);
    }
}
