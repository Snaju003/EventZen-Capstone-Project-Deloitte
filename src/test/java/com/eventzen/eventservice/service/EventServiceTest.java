package com.eventzen.eventservice.service;

import com.eventzen.eventservice.exception.ForbiddenException;
import com.eventzen.eventservice.model.Event;
import com.eventzen.eventservice.model.EventVendor;
import com.eventzen.eventservice.model.Vendor;
import com.eventzen.eventservice.repository.EventRepository;
import com.eventzen.eventservice.repository.VendorRepository;
import com.eventzen.eventservice.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private EventService eventService;

    private Event vendorEvent;

    @BeforeEach
    void setUp() {
        vendorEvent = Event.builder()
                .id("event-1")
                .title("Vendor Draft")
                .status("draft")
                .createdBy("vendor-user-1")
                .venueId("venue-1")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(3))
                .vendors(List.of())
                .build();

        when(venueRepository.findById(any())).thenReturn(Optional.empty());
    }

    @Test
    void vendorGetsOnlyOwnEvents() {
        Event own = Event.builder()
                .id("event-own")
                .status("draft")
                .createdBy("vendor-user-1")
                .venueId("venue-1")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .build();

        when(eventRepository.findByCreatedBy("vendor-user-1")).thenReturn(List.of(own));

        List<Event> result = eventService.getEvents("vendor-user-1", "vendor", null, null, null, null);

        assertEquals(1, result.size());
        assertEquals("event-own", result.get(0).getId());
        verify(eventRepository, never()).findAll();
    }

    @Test
    void publishDraftWithMultipleVendorsRequiresApprovedVendorSelection() {
        Event draft = Event.builder()
                .id("event-1")
                .status("draft")
                .venueId("venue-1")
                .startTime(LocalDateTime.now().plusDays(3))
                .endTime(LocalDateTime.now().plusDays(3).plusHours(2))
                .vendors(List.of(
                        EventVendor.builder().vendorId("vendor-a").agreedCost(1000.0).build(),
                        EventVendor.builder().vendorId("vendor-b").agreedCost(1200.0).build()
                ))
                .build();

        when(eventRepository.findById("event-1")).thenReturn(Optional.of(draft));
        when(eventRepository.existsPublishedVenueScheduleConflictExcludingEvent(eq("venue-1"), any(), any(), eq("event-1")))
                .thenReturn(false);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> eventService.publishEvent("event-1", "admin-user-1", "admin")
        );

        assertTrue(error.getMessage().contains("Select and approve a vendor"));
    }

    @Test
    void approvingAssignedVendorStoresApprovedVendorIdentity() {
        Event draft = Event.builder()
                .id("event-2")
                .status("draft")
                .createdBy("vendor-user-1")
                .venueId("venue-1")
                .startTime(LocalDateTime.now().plusDays(4))
                .endTime(LocalDateTime.now().plusDays(4).plusHours(2))
                .vendors(List.of(EventVendor.builder().vendorId("vendor-entity-1").agreedCost(900.0).build()))
                .build();

        Vendor vendor = Vendor.builder()
                .id("vendor-entity-1")
                .userId("vendor-user-1")
                .name("Vendor One")
                .build();

        when(eventRepository.findById("event-2")).thenReturn(Optional.of(draft));
        when(vendorRepository.findById("vendor-entity-1")).thenReturn(Optional.of(vendor));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event updated = eventService.approveEventVendor("event-2", "vendor-entity-1", "admin-user-1", "admin");

        assertEquals("vendor-entity-1", updated.getApprovedVendorId());
        assertEquals("vendor-user-1", updated.getApprovedVendorUserId());
        assertEquals("admin-user-1", updated.getApprovedBy());
    }

    @Test
    void vendorCannotCancelAnotherVendorsEvent() {
        Event otherVendorsEvent = Event.builder()
                .id("event-3")
                .status("draft")
                .createdBy("different-vendor")
                .venueId("venue-1")
                .startTime(LocalDateTime.now().plusDays(5))
                .endTime(LocalDateTime.now().plusDays(5).plusHours(2))
                .build();

        when(eventRepository.findById("event-3")).thenReturn(Optional.of(otherVendorsEvent));

        assertThrows(
                ForbiddenException.class,
                () -> eventService.cancelEvent("event-3", "vendor-user-1", "vendor")
        );
    }
}
