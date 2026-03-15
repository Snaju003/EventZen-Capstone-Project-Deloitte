package com.eventzen.eventservice.controller;

import com.eventzen.eventservice.dto.VendorRequestDTO;
import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Vendor;
import com.eventzen.eventservice.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    // GET /vendors - public (both roles)
    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getVendors());
    }

    // POST /vendors - admin only
    @PostMapping
    public ResponseEntity<Vendor> createVendor(
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody VendorRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.status(HttpStatus.CREATED).body(vendorService.createVendor(dto));
    }

    // PUT /vendors/{id} - admin only
    @PutMapping("/{id}")
    public ResponseEntity<Vendor> updateVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id,
            @Valid @RequestBody VendorRequestDTO dto) {

        requireAdmin(role);
        return ResponseEntity.ok(vendorService.updateVendor(id, dto));
    }

    // DELETE /vendors/{id} - admin only
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(
            @RequestHeader("X-User-Role") String role,
            @PathVariable String id) {

        requireAdmin(role);
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    private void requireAdmin(String role) {
        if (!"admin".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
