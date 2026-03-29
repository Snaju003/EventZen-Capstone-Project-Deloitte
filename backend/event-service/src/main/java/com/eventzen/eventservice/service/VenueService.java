package com.eventzen.eventservice.service;

import com.eventzen.eventservice.dto.VenueRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.exception.ResourceNotFoundException;
import com.eventzen.eventservice.model.Venue;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
                .imageUrls(normalizeImageUrls(dto.getImageUrls()))
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

        if (dto.getImageUrls() != null) {
            venue.setImageUrls(normalizeImageUrls(dto.getImageUrls()));
        }

        return venueRepository.save(venue);
    }

    public void deleteVenue(String id) {
        getVenueById(id); // ensure it exists

        boolean hasEvents = eventRepository.findByVenueId(id)
                .stream()
                .anyMatch(event -> "published".equalsIgnoreCase(event.getStatus()));
        if (hasEvents) {
            throw new ForbiddenException("Cannot delete venue: it is referenced by one or more published events");
        }

        venueRepository.deleteById(id);
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
