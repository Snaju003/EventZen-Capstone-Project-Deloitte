package com.eventzen.eventservice.controller;

import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.dto.VendorAssignmentDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // GET /events - role-aware (admin sees all, customer sees published only)
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestHeader("X-User-Role") String role) {

        return ResponseEntity.ok(eventService.getEvents(role));
    }

    // GET /events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    // POST /events - admin only
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody EventRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto, userId));
    }

    // PUT /events/{id} - admin only
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody EventRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    // DELETE /events/{id} - admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    // POST /events/{id}/publish - admin only
    @PostMapping("/{id}/publish")
    public ResponseEntity<Event> publishEvent(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.publishEvent(id));
    }

    // POST /events/{id}/cancel - admin only
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Event> cancelEvent(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.cancelEvent(id));
    }

    // POST /events/{id}/vendors - admin only
    @PostMapping("/{id}/vendors")
    public ResponseEntity<Event> addVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody VendorAssignmentDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.addVendorToEvent(id, dto));
    }

    // DELETE /events/{id}/vendors/{vendorId} - admin only
    @DeleteMapping("/{id}/vendors/{vendorId}")
    public ResponseEntity<Event> removeVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @PathVariable String vendorId) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.removeVendorFromEvent(id, vendorId));
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void requireAdmin(String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
