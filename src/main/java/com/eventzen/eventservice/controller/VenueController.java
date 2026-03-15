package com.eventzen.eventservice.controller;

import com.eventzen.eventservice.dto.VenueRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Venue;
import com.eventzen.eventservice.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    // GET /venues - public (both roles)
    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getVenues());
    }

    // GET /venues/{id} - public (both roles)
    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable String id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    // POST /venues - admin only
    @PostMapping
    public ResponseEntity<Venue> createVenue(
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody VenueRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(venueService.createVenue(dto));
    }

    // PUT /venues/{id} - admin only
    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody VenueRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(venueService.updateVenue(id, dto));
    }

    // DELETE /venues/{id} - admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void requireAdmin(String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
