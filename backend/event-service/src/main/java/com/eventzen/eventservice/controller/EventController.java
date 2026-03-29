package com.eventzen.eventservice.controller;

import com.eventzen.eventservice.dto.EventRequestDTO;
import com.eventzen.eventservice.dto.EventRejectionDTO;
import com.eventzen.eventservice.dto.EventPageResponse;
import com.eventzen.eventservice.dto.GenerateDescriptionDTO;
import com.eventzen.eventservice.dto.InternalEventAccessV1Response;
import com.eventzen.eventservice.dto.VendorAssignmentDTO;
import com.eventzen.eventservice.dto.VendorDeclineDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.service.EventService;
import com.eventzen.eventservice.service.GroqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final GroqService groqService;

    // POST /events/generate-description - admin or vendor
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody GenerateDescriptionDTO dto) {

        requireAdminOrVendor(role);
        String description = groqService.generateDescription(dto.getTitle());
        return ResponseEntity.ok(Map.of("description", description));
    }

    // GET /events - role-aware (admin sees all, customer sees published only)
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok(eventService.getEvents(userId, role, status, venueId, startDate, endDate));
    }

    // GET /events/page - role-aware paged list
    @GetMapping("/page")
    public ResponseEntity<EventPageResponse> getEventsPage(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String venueId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size,
            @RequestParam(required = false, defaultValue = "startTime") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir) {

        return ResponseEntity.ok(eventService.getEventsPage(
                userId,
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
        ));
    }

    // GET /events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return ResponseEntity.ok(eventService.getEventByIdForRequester(id, userId, role));
    }

    // GET /events/internal/v1/events/{id}/access
    // Internal contract endpoint consumed by budget-service.
    @GetMapping("/internal/v1/events/{id}/access")
    public ResponseEntity<InternalEventAccessV1Response> getInternalEventAccess(@PathVariable String id) {
        Event event = eventService.getEventByIdInternal(id);

        InternalEventAccessV1Response response = new InternalEventAccessV1Response(
                "v1",
                event.getId(),
                event.getCreatedBy(),
                event.getApprovedVendorUserId()
        );

        return ResponseEntity.ok(response);
    }

    // POST /events - admin or vendor
    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody EventRequestDTO dto) {

        requireAdminOrVendor(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto, userId, role));
    }

    // PUT /events/{id} - admin or vendor
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody EventRequestDTO dto) {

        requireAdminOrVendor(role);
        return ResponseEntity.ok(eventService.updateEvent(id, dto, userId, role));
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

    // POST /events/{id}/publish - admin only (approval)
    @PostMapping("/{id}/publish")
    public ResponseEntity<Event> publishEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.publishEvent(id, userId, role));
    }

    // POST /events/{id}/reject - admin only (approval)
    @PostMapping("/{id}/reject")
    public ResponseEntity<Event> rejectEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody EventRejectionDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.rejectEvent(id, dto.getReason(), userId, role));
    }

    // POST /events/{id}/cancel - admin or vendor
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Event> cancelEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdminOrVendor(role);
        return ResponseEntity.ok(eventService.cancelEvent(id, userId, role));
    }

    // POST /events/{id}/toggle-registration - admin or vendor
    @PostMapping("/{id}/toggle-registration")
    public ResponseEntity<Event> toggleRegistration(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdminOrVendor(role);
        return ResponseEntity.ok(eventService.toggleRegistration(id, userId, role));
    }

    // POST /events/{id}/vendors - admin only
    @PostMapping("/{id}/vendors")
    public ResponseEntity<Event> addVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody VendorAssignmentDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.addVendorToEvent(id, dto, role));
    }

    // POST /events/{id}/vendors/{vendorId}/approve - admin only
    @PostMapping("/{id}/vendors/{vendorId}/approve")
    public ResponseEntity<Event> approveEventVendor(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @PathVariable String vendorId) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.approveEventVendor(id, vendorId, userId, role));
    }

    // DELETE /events/{id}/vendors/{vendorId} - admin only
    @DeleteMapping("/{id}/vendors/{vendorId}")
    public ResponseEntity<Event> removeVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @PathVariable String vendorId) {

        requireAdmin(role);
        return ResponseEntity.ok(eventService.removeVendorFromEvent(id, vendorId, role));
    }

    // POST /events/{id}/vendor-accept - vendor only (vendor confirms assignment)
    @PostMapping("/{id}/vendor-accept")
    public ResponseEntity<Event> vendorAcceptEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireVendor(role);
        return ResponseEntity.ok(eventService.vendorAcceptEvent(id, userId));
    }

    // POST /events/{id}/vendor-decline - vendor only (vendor declines assignment)
    @PostMapping("/{id}/vendor-decline")
    public ResponseEntity<Event> vendorDeclineEvent(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @RequestBody(required = false) VendorDeclineDTO dto) {

        requireVendor(role);
        String reason = dto != null ? dto.getReason() : null;
        return ResponseEntity.ok(eventService.vendorDeclineEvent(id, userId, reason));
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void requireAdminOrVendor(String role) {
        if (!"admin".equalsIgnoreCase(role) && !"vendor".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Admin or vendor access required");
        }
    }

    private void requireAdmin(String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Admin access required");
        }
    }

    private void requireVendor(String role) {
        if (!"vendor".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Vendor access required");
        }
    }
}
