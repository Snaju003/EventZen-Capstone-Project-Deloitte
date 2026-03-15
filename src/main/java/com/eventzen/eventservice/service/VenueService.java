package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.VenueRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Venue;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;

    public Venue createVenue(VenueRequestDTO dto) {
        Venue venue = Venue.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .capacity(dto.getCapacity())
                .description(dto.getDescription())
                .build();
        return venueRepository.save(venue);
    }

    public List<Venue> getVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(String id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", id));
    }

    public Venue updateVenue(String id, VenueRequestDTO dto) {
        Venue venue = getVenueById(id);
        venue.setName(dto.getName());
        venue.setAddress(dto.getAddress());
        venue.setCapacity(dto.getCapacity());
        venue.setDescription(dto.getDescription());
        return venueRepository.save(venue);
    }

    public void deleteVenue(String id) {
        getVenueById(id); // ensure it exists

        boolean hasEvents = !eventRepository.findByVenueId(id).isEmpty();
        if (hasEvents) {
            throw new ForbiddenException("Cannot delete venue: it is referenced by one or more events");
        }

        venueRepository.deleteById(id);
    }
}
