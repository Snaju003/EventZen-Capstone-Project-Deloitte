package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.EventPageResponse;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
class EventReadOperations {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;

    EventReadOperations(EventRepository eventRepository, VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
    }

    List<Event> getEvents(String requesterId, String role, String status, String venueId, LocalDate startDate, LocalDate endDate) {
        try {
            boolean isAdmin = "admin".equalsIgnoreCase(role);
            boolean isVendor = "vendor".equalsIgnoreCase(role);
            boolean isPrivileged = isAdmin || isVendor;

            List<Event> events;
            if (isAdmin) {
                events = eventRepository.findAll();
            } else if (isVendor) {
                if (requesterId == null || requesterId.isBlank()) {
                    throw new ForbiddenException("Vendor identity is required");
                }
                // Vendors see events they created + events assigned to them (pending_vendor)
                List<Event> createdEvents = eventRepository.findByCreatedBy(requesterId);
                List<Event> assignedEvents = eventRepository.findByApprovedVendorUserId(requesterId);
                // Merge without duplicates
                java.util.Set<String> seen = new java.util.HashSet<>();
                events = new ArrayList<>();
                for (Event e : createdEvents) {
                    if (seen.add(e.getId())) events.add(e);
                }
                for (Event e : assignedEvents) {
                    if (seen.add(e.getId())) events.add(e);
                }
            } else {
                events = eventRepository.findByStatus("published");
            }

            return events.stream()
                    .filter(event -> {
                        if (isPrivileged) {
                            return true;
                        }

                        return !hasEventConcluded(event);
                    })
                    .filter(event -> {
                        if (status == null || status.isBlank()) {
                            return true;
                        }

                        if (!isPrivileged && !"published".equalsIgnoreCase(status)) {
                            return false;
                        }

                        return status.equalsIgnoreCase(event.getStatus());
                    })
                    .filter(event -> venueId == null || venueId.isBlank() || venueId.equals(event.getVenueId()))
                    .filter(event -> {
                        if (startDate == null) {
                            return true;
                        }

                        if (event.getStartTime() == null) {
                            return false;
                        }

                        return !event.getStartTime().toLocalDate().isBefore(startDate);
                    })
                    .filter(event -> {
                        if (endDate == null) {
                            return true;
                        }

                        if (event.getEndTime() == null) {
                            return false;
                        }

                        return !event.getEndTime().toLocalDate().isAfter(endDate);
                    })
                    .map(this::attachVenue)
                    .toList();
        } catch (Exception exception) {
            if ("published".equalsIgnoreCase(status) && venueId != null && !venueId.isBlank()) {
                log.warn("Falling back to empty result for published venue filter (venueId={}) due to query error", venueId, exception);
                return List.of();
            }

            throw exception;
        }
    }

    EventPageResponse getEventsPage(
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
        List<Event> filteredEvents = new ArrayList<>(getEvents(requesterId, role, status, venueId, startDate, endDate));

        if (search != null && !search.isBlank()) {
            String normalizedSearch = search.trim().toLowerCase();
            filteredEvents = filteredEvents.stream()
                    .filter(event -> {
                        String title = event.getTitle() == null ? "" : event.getTitle().toLowerCase();
                        String description = event.getDescription() == null ? "" : event.getDescription().toLowerCase();
                        String venueName = event.getVenue() != null && event.getVenue().getName() != null
                                ? event.getVenue().getName().toLowerCase()
                                : "";
                        String venueAddress = event.getVenue() != null && event.getVenue().getAddress() != null
                                ? event.getVenue().getAddress().toLowerCase()
                                : "";

                        return title.contains(normalizedSearch)
                                || description.contains(normalizedSearch)
                                || venueName.contains(normalizedSearch)
                                || venueAddress.contains(normalizedSearch);
                    })
                    .collect(Collectors.toCollection(ArrayList::new));
        }

        Comparator<Event> comparator = resolveSortComparator(sortBy);
        if (!"asc".equalsIgnoreCase(sortDir)) {
            comparator = comparator.reversed();
        }

        filteredEvents.sort(comparator);

        int resolvedSize = size == null || size < 1 ? 12 : Math.min(size, 100);
        int resolvedPage = page == null || page < 1 ? 1 : page;
        int fromIndex = Math.max(0, (resolvedPage - 1) * resolvedSize);
        int toIndex = Math.min(filteredEvents.size(), fromIndex + resolvedSize);
        List<Event> pageItems = fromIndex >= filteredEvents.size()
                ? List.of()
                : filteredEvents.subList(fromIndex, toIndex);

        long total = filteredEvents.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / resolvedSize);
        boolean hasNext = resolvedPage < totalPages;

        return new EventPageResponse(pageItems, resolvedPage, resolvedSize, total, totalPages, hasNext);
    }

    Event getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        return attachVenue(event);
    }

    Event getEventByIdInternal(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
    }

    Event getEventByIdForRequester(String id, String requesterId, String requesterRole) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));

        if ("published".equalsIgnoreCase(event.getStatus())) {
            return attachVenue(event);
        }

        if ("admin".equalsIgnoreCase(requesterRole)) {
            return attachVenue(event);
        }

        if ("vendor".equalsIgnoreCase(requesterRole) && Objects.equals(event.getCreatedBy(), requesterId)) {
            return attachVenue(event);
        }

        // Vendors can also view events assigned to them
        if ("vendor".equalsIgnoreCase(requesterRole) && Objects.equals(event.getApprovedVendorUserId(), requesterId)) {
            return attachVenue(event);
        }

        throw new ForbiddenException("You are not allowed to view this event");
    }

    private Event attachVenue(Event event) {
        if (event == null) {
            return null;
        }

        String venueId = event.getVenueId();
        if (venueId == null || venueId.isBlank()) {
            event.setVenue(null);
            return event;
        }

        try {
            venueRepository.findById(venueId).ifPresent(event::setVenue);
        } catch (Exception exception) {
            log.warn("Failed to attach venue {} to event {}", venueId, event.getId(), exception);
            event.setVenue(null);
        }
        return event;
    }

    private Comparator<Event> resolveSortComparator(String sortBy) {
        if ("title".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    event -> event.getTitle() == null ? "" : event.getTitle().toLowerCase(),
                    Comparator.nullsLast(String::compareTo)
            );
        }

        if ("status".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(
                    event -> event.getStatus() == null ? "" : event.getStatus().toLowerCase(),
                    Comparator.nullsLast(String::compareTo)
            );
        }

        return Comparator.comparing(
                Event::getStartTime,
                Comparator.nullsLast(LocalDateTime::compareTo)
        );
    }

    private boolean hasEventConcluded(Event event) {
        if (event == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (event.getEndTime() != null) {
            return event.getEndTime().isBefore(now);
        }

        if (event.getStartTime() != null) {
            return event.getStartTime().isBefore(now);
        }

        return false;
    }
}
