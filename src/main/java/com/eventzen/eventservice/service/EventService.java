package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.dto.VendorAssignmentDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Budget;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.model.EventVendor;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import com.eventzen.eventservice.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final VendorRepository vendorRepository;

    // ─── CRUD ──────────────────────────────────────────────────────────────────

    public Event createEvent(EventRequestDTO dto, String createdBy) {
        // Validate venue exists
        venueRepository.findById(dto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", dto.getVenueId()));

        // Validate time range
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .venueId(dto.getVenueId())
                .createdBy(createdBy)
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .ticketPrice(dto.getTicketPrice())
                .maxAttendees(dto.getMaxAttendees())
                .status("draft")
                .budget(Budget.builder().totalBudget(0.0).spent(0.0).expenses(new ArrayList<>()).build())
                .vendors(new ArrayList<>())
                .build();

        return eventRepository.save(event);
    }

    public List<Event> getEvents(String role) {
        if ("admin".equalsIgnoreCase(role)) {
            return eventRepository.findAll();
        }
        // customers only see published events
        return eventRepository.findByStatus("published");
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    public Event updateEvent(String id, EventRequestDTO dto) {
        Event event = getEventById(id);

        if ("cancelled".equals(event.getStatus())) {
            throw new ForbiddenException("Cannot update a cancelled event");
        }

        // Validate venue exists
        venueRepository.findById(dto.getVenueId())
                .orElseThrow(() -> new ResourceNotFoundException("Venue", dto.getVenueId()));

        // Validate time range
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setVenueId(dto.getVenueId());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setTicketPrice(dto.getTicketPrice());
        event.setMaxAttendees(dto.getMaxAttendees());

        return eventRepository.save(event);
    }

    public void deleteEvent(String id) {
        getEventById(id); // ensure it exists
        eventRepository.deleteById(id);
    }

    // ─── Lifecycle ─────────────────────────────────────────────────────────────

    public Event publishEvent(String id) {
        Event event = getEventById(id);

        if (!"draft".equals(event.getStatus())) {
            throw new IllegalArgumentException("Only draft events can be published");
        }

        event.setStatus("published");
        return eventRepository.save(event);
    }

    public Event cancelEvent(String id) {
        Event event = getEventById(id);

        if ("cancelled".equals(event.getStatus())) {
            throw new IllegalArgumentException("Event is already cancelled");
        }

        event.setStatus("cancelled");
        return eventRepository.save(event);
    }

    // ─── Vendor Assignment ─────────────────────────────────────────────────────

    public Event addVendorToEvent(String eventId, VendorAssignmentDTO dto) {
        Event event = getEventById(eventId);

        // Validate vendor exists
        vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", dto.getVendorId()));

        // Check if vendor already assigned
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

    public Event removeVendorFromEvent(String eventId, String vendorId) {
        Event event = getEventById(eventId);

        boolean removed = event.getVendors().removeIf(v -> v.getVendorId().equals(vendorId));
        if (!removed) {
            throw new ResourceNotFoundException("Vendor assignment not found for vendorId: " + vendorId);
        }

        return eventRepository.save(event);
    }
}
